"""Simulation API tests (T-305, T-309, T-313, UC-040–044, RF-042)."""

from __future__ import annotations

import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func, select

from core.ml_registry import ml_registry
from models.simulation import Simulation, SimulationInput

VALID_PREDICT_PAYLOAD = {
    "age": 65,
    "gender": "Female",
    "hospital_stay_days": 3,
    "medications_count": 8,
    "previous_admissions": 3,
    "glucose": 180,
    "blood_pressure": 120,
    "bmi": 28.4,
}


@pytest.fixture(scope="module", autouse=True)
def ensure_ml_loaded() -> None:
    if not ml_registry.is_ready:
        ml_registry.load()
    if not ml_registry.is_ready:
        pytest.skip(f"ML artifacts unavailable: {ml_registry.load_error}")


def _create_prediction_id(client: TestClient, headers: dict[str, str]) -> uuid.UUID:
    response = client.post("/predict", json=VALID_PREDICT_PAYLOAD, headers=headers)
    assert response.status_code == 200
    return uuid.UUID(response.json()["id"])


def test_simulate_requires_authentication(client: TestClient) -> None:
    response = client.post(
        "/simulate",
        json={
            "prediction_id": str(uuid.uuid4()),
            "modifications": {"previous_admissions": 0},
        },
    )
    assert response.status_code == 401


def test_simulate_valid_payload_returns_comparison(
    client: TestClient,
    auth_header,
    seed_user,
) -> None:
    seed_user(email="clinician@medscope.ai", role_name="clinician")
    headers = auth_header("clinician@medscope.ai")
    prediction_id = _create_prediction_id(client, headers)

    response = client.post(
        "/simulate",
        json={
            "prediction_id": str(prediction_id),
            "modifications": {"previous_admissions": 0},
        },
        headers=headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["id"]
    assert data["prediction_id"] == str(prediction_id)
    assert 0.0 <= data["original_risk_score"] <= 1.0
    assert 0.0 <= data["simulated_risk_score"] <= 1.0
    assert data["original_risk_level"] in {"low", "medium", "high"}
    assert data["simulated_risk_level"] in {"low", "medium", "high"}
    assert data["delta_risk_percent"] == pytest.approx(
        data["simulated_risk_percent"] - data["original_risk_percent"],
        abs=0.01,
    )
    assert data["simulation_summary"]
    assert len(data["changes"]) >= 1
    assert data["changes"][0]["feature_name"] == "previous_admissions"
    assert data["simulation_time_ms"] >= 0
    assert data["model_version"]
    assert data["created_at"]


def test_simulate_persisted_in_database(
    client: TestClient,
    auth_header,
    seed_user,
    db_session,
) -> None:
    user = seed_user(email="nurse-sim@medscope.ai", role_name="nurse")
    headers = auth_header("nurse-sim@medscope.ai")
    prediction_id = _create_prediction_id(client, headers)

    before = db_session.scalar(select(func.count()).select_from(Simulation)) or 0
    response = client.post(
        "/simulate",
        json={
            "prediction_id": str(prediction_id),
            "modifications": {"previous_admissions": 0},
        },
        headers=headers,
    )
    assert response.status_code == 200

    simulation_id = uuid.UUID(response.json()["id"])
    after = db_session.scalar(select(func.count()).select_from(Simulation)) or 0
    assert after == before + 1

    simulation = db_session.get(Simulation, simulation_id)
    assert simulation is not None
    assert simulation.prediction_id == prediction_id
    assert simulation.user_id == user.id
    assert float(simulation.original_risk) == response.json()["original_risk_percent"]
    assert float(simulation.simulated_risk) == response.json()["simulated_risk_percent"]
    assert float(simulation.delta_risk) == response.json()["delta_risk_percent"]
    assert simulation.simulation_summary == response.json()["simulation_summary"]

    inputs = db_session.scalars(
        select(SimulationInput).where(SimulationInput.simulation_id == simulation_id)
    ).all()
    assert len(inputs) == len(response.json()["changes"])
    for stored, item in zip(inputs, response.json()["changes"], strict=True):
        assert stored.feature_name == item["feature_name"]
        assert stored.original_value == item["original_value"]
        assert stored.simulated_value == item["simulated_value"]


def test_simulate_empty_modifications_returns_422(
    client: TestClient,
    auth_header,
    seed_user,
) -> None:
    seed_user(email="clinician@medscope.ai", role_name="clinician")
    headers = auth_header("clinician@medscope.ai")
    prediction_id = _create_prediction_id(client, headers)

    response = client.post(
        "/simulate",
        json={"prediction_id": str(prediction_id), "modifications": {}},
        headers=headers,
    )

    assert response.status_code == 422


def test_simulate_unknown_prediction_returns_404(
    client: TestClient,
    auth_header,
    seed_user,
) -> None:
    seed_user(email="clinician@medscope.ai", role_name="clinician")
    headers = auth_header("clinician@medscope.ai")

    response = client.post(
        "/simulate",
        json={
            "prediction_id": str(uuid.uuid4()),
            "modifications": {"glucose": 120},
        },
        headers=headers,
    )

    assert response.status_code == 404


def test_simulate_forbids_analyst_role(client: TestClient, db_session) -> None:
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
            email="analyst-sim@medscope.ai",
            password_hash=auth.hash_password("MedScope123!"),
            is_active=True,
        )
    )
    db_session.commit()

    login = client.post(
        "/auth/login",
        json={"email": "analyst-sim@medscope.ai", "password": "MedScope123!"},
    )
    token = login.json()["access_token"]
    response = client.post(
        "/simulate",
        json={
            "prediction_id": str(uuid.uuid4()),
            "modifications": {"glucose": 120},
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403
