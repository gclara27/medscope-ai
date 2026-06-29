"""Analytics PDF export tests (T-X04, UC-063)."""

from __future__ import annotations

from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient

from core.ml_registry import ml_registry
from services.analytics_pdf_service import build_analytics_pdf
from services.analytics_service import AnalyticsService

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


def test_build_analytics_pdf_returns_pdf_bytes(db_session) -> None:
    analytics = AnalyticsService(db_session).get_analytics()
    pdf_bytes = build_analytics_pdf(analytics)

    assert pdf_bytes.startswith(b"%PDF")
    assert len(pdf_bytes) > 500


def test_analytics_export_requires_authentication(client: TestClient) -> None:
    response = client.get("/analytics/export.pdf")
    assert response.status_code == 401


def test_analytics_export_pdf_for_analyst(
    client: TestClient,
    auth_header,
    seed_user,
) -> None:
    seed_user(email="clinician-export@medscope.ai", role_name="clinician")
    clinician_headers = auth_header("clinician-export@medscope.ai")
    predict = client.post("/predict", json=VALID_PREDICT_PAYLOAD, headers=clinician_headers)
    assert predict.status_code == 200

    seed_user(email="analyst-export@medscope.ai", role_name="analyst")
    headers = auth_header("analyst-export@medscope.ai")

    today = date.today()
    response = client.get(
        f"/analytics/export.pdf?date_from={today.isoformat()}&date_to={today.isoformat()}",
        headers=headers,
    )

    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.content.startswith(b"%PDF")
    assert "attachment" in response.headers["content-disposition"]
    assert "medscope-analytics" in response.headers["content-disposition"]


def test_analytics_export_forbids_nurse_role(
    client: TestClient,
    auth_header,
    seed_user,
) -> None:
    seed_user(email="nurse-export@medscope.ai", role_name="nurse")
    headers = auth_header("nurse-export@medscope.ai")

    response = client.get("/analytics/export.pdf", headers=headers)
    assert response.status_code == 403


def test_analytics_export_invalid_date_range_returns_422(
    client: TestClient,
    auth_header,
    seed_user,
) -> None:
    seed_user(email="analyst-export-dates@medscope.ai", role_name="analyst")
    headers = auth_header("analyst-export-dates@medscope.ai")
    today = date.today()
    earlier = today - timedelta(days=5)

    response = client.get(
        f"/analytics/export.pdf?date_from={today.isoformat()}&date_to={earlier.isoformat()}",
        headers=headers,
    )
    assert response.status_code == 422
