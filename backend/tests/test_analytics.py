"""Analytics API tests (T-307, T-314, UC-060–062, RF-060–062)."""

from __future__ import annotations

from datetime import date, timedelta

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


def test_analytics_requires_authentication(client: TestClient) -> None:
    response = client.get("/analytics")
    assert response.status_code == 401


def test_analytics_returns_kpis_and_distribution(
    client: TestClient,
    auth_header,
    seed_user,
) -> None:
    seed_user(email="clinician-for-analytics@medscope.ai", role_name="clinician")
    clinician_headers = auth_header("clinician-for-analytics@medscope.ai")
    predict = client.post("/predict", json=VALID_PREDICT_PAYLOAD, headers=clinician_headers)
    assert predict.status_code == 200

    seed_user(email="analyst-kpi@medscope.ai", role_name="analyst")
    headers = auth_header("analyst-kpi@medscope.ai")

    response = client.get("/analytics", headers=headers)
    assert response.status_code == 200
    data = response.json()

    assert data["summary"]["total_predictions"] >= 1
    assert 0.0 <= data["summary"]["average_risk_percent"] <= 100.0
    assert len(data["risk_distribution"]) == 3
    assert {item["risk_level"] for item in data["risk_distribution"]} == {
        "low",
        "medium",
        "high",
    }
    assert sum(item["count"] for item in data["risk_distribution"]) == data["summary"]["total_predictions"]
    assert len(data["trend"]) >= 1
    assert data["trend"][-1]["count"] >= 1


def test_analytics_date_filter(
    client: TestClient,
    auth_header,
    seed_user,
) -> None:
    seed_user(email="clinician-analytics-filter@medscope.ai", role_name="clinician")
    clinician_headers = auth_header("clinician-analytics-filter@medscope.ai")
    client.post("/predict", json=VALID_PREDICT_PAYLOAD, headers=clinician_headers)

    seed_user(email="analyst-filter@medscope.ai", role_name="analyst")
    headers = auth_header("analyst-filter@medscope.ai")

    today = date.today()
    response = client.get(
        f"/analytics?date_from={today.isoformat()}&date_to={today.isoformat()}",
        headers=headers,
    )
    assert response.status_code == 200
    assert response.json()["summary"]["total_predictions"] >= 1

    past = today - timedelta(days=30)
    earlier = today - timedelta(days=20)
    empty = client.get(
        f"/analytics?date_from={past.isoformat()}&date_to={earlier.isoformat()}",
        headers=headers,
    )
    assert empty.status_code == 200
    assert empty.json()["summary"]["total_predictions"] == 0


def test_analytics_invalid_date_range_returns_422(
    client: TestClient,
    auth_header,
    seed_user,
) -> None:
    seed_user(email="analyst-dates@medscope.ai", role_name="analyst")
    headers = auth_header("analyst-dates@medscope.ai")
    today = date.today()
    earlier = today - timedelta(days=5)

    response = client.get(
        f"/analytics?date_from={today.isoformat()}&date_to={earlier.isoformat()}",
        headers=headers,
    )
    assert response.status_code == 422


def test_analytics_forbids_nurse_role(
    client: TestClient,
    auth_header,
    seed_user,
) -> None:
    seed_user(email="nurse-analytics@medscope.ai", role_name="nurse")
    headers = auth_header("nurse-analytics@medscope.ai")
    response = client.get("/analytics", headers=headers)
    assert response.status_code == 403


def test_analytics_admin_role_allowed(
    client: TestClient,
    auth_header,
    seed_user,
) -> None:
    seed_user(email="admin-analytics@medscope.ai", role_name="admin")
    headers = auth_header("admin-analytics@medscope.ai")
    response = client.get("/analytics", headers=headers)
    assert response.status_code == 200
