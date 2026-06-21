"""Prediction API tests (T-313, UC-022–023, UC-030, RTS-001)."""

from __future__ import annotations

import uuid

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from sqlalchemy import func, select

from core.ml_registry import ml_registry
from models.patient_input import PatientInput
from models.prediction import Prediction
from models.shap_explanation import ShapExplanation

VALID_PAYLOAD = {
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


def test_predict_requires_authentication(client: TestClient) -> None:
    response = client.post("/predict", json=VALID_PAYLOAD)
    assert response.status_code == 401


def test_predict_valid_payload_returns_score_and_shap(
    client: TestClient,
    auth_header,
    seed_user,
) -> None:
    seed_user(email="clinician@medscope.ai", role_name="clinician")
    headers = auth_header("clinician@medscope.ai")

    response = client.post("/predict", json=VALID_PAYLOAD, headers=headers)

    assert response.status_code == 200
    data = response.json()
    assert 0.0 <= data["risk_score"] <= 1.0
    assert 0.0 <= data["risk_percent"] <= 100.0
    assert data["risk_level"] in {"low", "medium", "high"}
    assert data["summary"]
    assert data["model_version"]
    assert data["prediction_time_ms"] >= 0
    assert len(data["shap_explanations"]) >= 1
    assert data["shap_explanations"][0]["feature_name"]
    assert data["shap_explanations"][0]["importance_rank"] == 1


def test_predict_invalid_payload_returns_422(
    client: TestClient,
    auth_header,
    seed_user,
) -> None:
    seed_user(email="clinician@medscope.ai", role_name="clinician")
    headers = auth_header("clinician@medscope.ai")

    invalid_payload = {**VALID_PAYLOAD, "age": -1}
    response = client.post("/predict", json=invalid_payload, headers=headers)

    assert response.status_code == 422


def test_predict_missing_glucose_returns_422(
    client: TestClient,
    auth_header,
    seed_user,
) -> None:
    seed_user(email="clinician@medscope.ai", role_name="clinician")
    headers = auth_header("clinician@medscope.ai")

    payload = {k: v for k, v in VALID_PAYLOAD.items() if k != "glucose"}
    response = client.post("/predict", json=payload, headers=headers)

    assert response.status_code == 422


def test_predict_persisted_in_database(
    client: TestClient,
    auth_header,
    seed_user,
    db_session,
) -> None:
    user = seed_user(email="nurse@medscope.ai", role_name="nurse")
    headers = auth_header("nurse@medscope.ai")

    before_predictions = db_session.scalar(select(func.count()).select_from(Prediction)) or 0
    response = client.post("/predict", json=VALID_PAYLOAD, headers=headers)
    assert response.status_code == 200

    prediction_id = uuid.UUID(response.json()["id"])
    after_predictions = db_session.scalar(select(func.count()).select_from(Prediction)) or 0
    assert after_predictions == before_predictions + 1

    prediction = db_session.get(Prediction, prediction_id)
    assert prediction is not None
    assert prediction.user_id == user.id
    assert prediction.risk_level == response.json()["risk_level"]

    patient_input = db_session.scalar(
        select(PatientInput).where(PatientInput.prediction_id == prediction.id)
    )
    assert patient_input is not None
    assert patient_input.age == VALID_PAYLOAD["age"]

    shap_count = db_session.scalar(
        select(func.count())
        .select_from(ShapExplanation)
        .where(ShapExplanation.prediction_id == prediction.id)
    )
    assert shap_count == len(response.json()["shap_explanations"])

    stored_shap = db_session.scalars(
        select(ShapExplanation)
        .where(ShapExplanation.prediction_id == prediction.id)
        .order_by(ShapExplanation.importance_rank)
    ).all()
    response_shap = response.json()["shap_explanations"]
    for stored, item in zip(stored_shap, response_shap, strict=True):
        assert stored.direction == item["direction"]
        assert stored.direction in {"increases_risk", "decreases_risk"}


from schemas.prediction import PredictRequest
from services.prediction_service import PredictionService


def test_predict_does_not_retry_ml_load_when_unavailable() -> None:
    """ML loads once at startup; predict must not call registry.load() per request."""
    from unittest.mock import MagicMock

    registry = MagicMock()
    registry.is_ready = False
    registry.explainer_service = None
    registry.load_error = "SHAP background missing at models/shap_background.npy"

    service = PredictionService(db=MagicMock(), registry=registry)
    with pytest.raises(HTTPException) as exc_info:
        service.predict(uuid.uuid4(), PredictRequest(**VALID_PAYLOAD))

    assert exc_info.value.status_code == 503
    assert "shap_background" in exc_info.value.detail
    registry.load.assert_not_called()


def test_predict_forbids_analyst_role(client: TestClient, db_session) -> None:
    from models.role import Role
    from models.user import User
    from services.auth_service import AuthService

    role = Role(name="analyst")
    db_session.add(role)
    db_session.flush()
    auth = AuthService(db_session)
    db_session.add(
        User(
            role_id=role.id,
            first_name="Analyst",
            last_name="User",
            email="analyst@medscope.ai",
            password_hash=auth.hash_password("MedScope123!"),
            is_active=True,
        )
    )
    db_session.commit()

    login = client.post(
        "/auth/login",
        json={"email": "analyst@medscope.ai", "password": "MedScope123!"},
    )
    token = login.json()["access_token"]
    response = client.post(
        "/predict",
        json=VALID_PAYLOAD,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403
