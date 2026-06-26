"""Dashboard API tests (T-501, UC-010, RF-010–011)."""

from __future__ import annotations

import time

import pytest
from fastapi.testclient import TestClient

from core.ml_registry import ml_registry

VALID_PREDICT_PAYLOAD = {
    "age": 65,
    "gender": "Female",
    "hospital_stay_days": 3,
    "medications_count": 8,
    "previous_admissions": 1,
    "glucose": 140,
    "blood_pressure": 120,
    "bmi": 28.4,
}


@pytest.fixture(scope="module", autouse=True)
def ensure_ml_loaded() -> None:
    if not ml_registry.is_ready:
        ml_registry.load()
    if not ml_registry.is_ready:
        pytest.skip(f"ML artifacts unavailable: {ml_registry.load_error}")


def test_dashboard_requires_authentication(client: TestClient) -> None:
    response = client.get("/dashboard")
    assert response.status_code == 401


def test_dashboard_returns_kpis_for_clinician(
    client: TestClient,
    auth_header,
    seed_user,
) -> None:
    seed_user(email="clinician-dashboard@medscope.ai", role_name="clinician")
    headers = auth_header("clinician-dashboard@medscope.ai")

    predict = client.post("/predict", json=VALID_PREDICT_PAYLOAD, headers=headers)
    assert predict.status_code == 200

    response = client.get("/dashboard", headers=headers)
    assert response.status_code == 200
    data = response.json()

    assert data["kpis"]["total_evaluations"] >= 1
    assert 0.0 <= data["kpis"]["average_risk_percent"] <= 100.0
    assert data["kpis"]["evaluations_last_24h"] >= 1
    assert len(data["risk_distribution"]) == 3
    assert "recent_evaluations" in data
    assert "high_risk_alerts" in data
    assert len(data["recent_evaluations"]) >= 1
    assert sum(item["count"] for item in data["risk_distribution"]) == data["kpis"]["total_evaluations"]


def test_dashboard_available_for_nurse(client: TestClient, auth_header, seed_user) -> None:
    seed_user(email="nurse-dashboard@medscope.ai", role_name="nurse")
    headers = auth_header("nurse-dashboard@medscope.ai")

    response = client.get("/dashboard", headers=headers)
    assert response.status_code == 200


def test_dashboard_forbidden_for_unauthenticated_role(client: TestClient) -> None:
    response = client.get("/dashboard")
    assert response.status_code == 401


def test_dashboard_responds_within_rnf002_budget(
    client: TestClient,
    auth_header,
    seed_user,
) -> None:
    """GET /dashboard should complete within 2 seconds (RNF-002, T-504)."""
    seed_user(email="clinician-dashboard-perf@medscope.ai", role_name="clinician")
    headers = auth_header("clinician-dashboard-perf@medscope.ai")

    started = time.perf_counter()
    response = client.get("/dashboard", headers=headers)
    elapsed = time.perf_counter() - started

    assert response.status_code == 200
    assert elapsed < 2.0, f"Dashboard took {elapsed:.3f}s"
