"""Demo API tests — public playground endpoints (no auth, no persistence)."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func, select

from core.ml_registry import ml_registry
from models.prediction import Prediction
from models.simulation import Simulation

HIGH_RISK_PAYLOAD = {
    "age": 72,
    "gender": "Female",
    "hospital_stay_days": 6,
    "medications_count": 12,
    "previous_admissions": 5,
    "glucose": 198,
    "blood_pressure": 142,
    "bmi": 31.2,
}


@pytest.fixture(scope="module", autouse=True)
def ensure_ml_loaded() -> None:
    if not ml_registry.is_ready:
        ml_registry.load()
    if not ml_registry.is_ready:
        pytest.skip(f"ML artifacts unavailable: {ml_registry.load_error}")


def test_demo_predict_works_without_auth(client: TestClient, db_session) -> None:
    before = db_session.scalar(select(func.count()).select_from(Prediction))

    response = client.post("/demo/predict", json=HIGH_RISK_PAYLOAD)

    assert response.status_code == 200
    data = response.json()
    assert data["risk_level"] == "high"
    assert len(data["shap_explanations"]) >= 1

    after = db_session.scalar(select(func.count()).select_from(Prediction))
    assert after == before


def test_demo_simulate_works_without_auth(client: TestClient, db_session) -> None:
    before_predictions = db_session.scalar(select(func.count()).select_from(Prediction))
    before_simulations = db_session.scalar(select(func.count()).select_from(Simulation))

    response = client.post(
        "/demo/simulate",
        json={
            "baseline": HIGH_RISK_PAYLOAD,
            "modifications": {
                "previous_admissions": 2,
                "glucose": 140,
            },
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["delta_risk_percent"] < 0
    assert len(data["changes"]) >= 2

    after_predictions = db_session.scalar(select(func.count()).select_from(Prediction))
    after_simulations = db_session.scalar(select(func.count()).select_from(Simulation))
    assert after_predictions == before_predictions
    assert after_simulations == before_simulations
