"""Simulation service tests (T-303, UC-040–043, RF-042)."""

from __future__ import annotations

import uuid

import pytest
from fastapi import HTTPException

from core.ml_registry import ml_registry
from models.patient_input import PatientInput
from models.prediction import Prediction
from schemas.simulation import SimulateModifications, SimulateRequest
from services.simulation_service import SimulationService


@pytest.fixture(scope="module", autouse=True)
def ensure_ml_loaded() -> None:
    if not ml_registry.is_ready:
        ml_registry.load()
    if not ml_registry.is_ready:
        pytest.skip(f"ML artifacts unavailable: {ml_registry.load_error}")


def _seed_prediction_with_input(db_session, *, risk_percent: float = 72.5) -> Prediction:
    from models.role import Role
    from models.user import User

    role = Role(name="clinician")
    db_session.add(role)
    db_session.flush()
    user = User(
        role_id=role.id,
        first_name="Sim",
        last_name="Clinician",
        email=f"sim-{uuid.uuid4()}@medscope.ai",
        password_hash="$2b$12$hash",
    )
    db_session.add(user)
    db_session.flush()

    prediction = Prediction(
        user_id=user.id,
        risk_score=risk_percent,
        risk_level="high",
        model_version="logistic_regression-v1",
    )
    db_session.add(prediction)
    db_session.flush()
    db_session.add(
        PatientInput(
            prediction_id=prediction.id,
            age=65,
            gender="female",
            glucose=180,
            blood_pressure=120,
            medications_count=8,
            previous_admissions=3,
            hospital_stay_days=3,
            bmi=28.4,
        )
    )
    db_session.commit()
    db_session.refresh(prediction)
    return prediction


def test_simulate_returns_original_vs_simulated_comparison(db_session) -> None:
    prediction = _seed_prediction_with_input(db_session)
    service = SimulationService(db_session, ml_registry)

    result = service.simulate(
        prediction.user_id,
        SimulateRequest(
            prediction_id=prediction.id,
            modifications=SimulateModifications(previous_admissions=0),
        ),
    )

    assert result.id is not None
    assert result.prediction_id == prediction.id
    assert result.original_risk_percent == 72.5
    assert 0.0 <= result.simulated_risk_score <= 1.0
    assert 0.0 <= result.simulated_risk_percent <= 100.0
    assert result.delta_risk_percent == pytest.approx(
        result.simulated_risk_percent - result.original_risk_percent,
        abs=0.01,
    )
    assert result.simulation_summary
    assert len(result.changes) == 1
    assert result.changes[0].feature_name == "previous_admissions"
    assert result.changes[0].original_value == "3"
    assert result.changes[0].simulated_value == "0"
    assert result.simulation_time_ms >= 0

    from sqlalchemy import func, select

    from models.simulation import Simulation, SimulationInput

    stored = db_session.get(Simulation, result.id)
    assert stored is not None
    assert stored.user_id == prediction.user_id
    assert float(stored.original_risk) == result.original_risk_percent
    assert float(stored.simulated_risk) == result.simulated_risk_percent
    assert float(stored.delta_risk) == result.delta_risk_percent

    input_count = db_session.scalar(
        select(func.count()).select_from(SimulationInput).where(SimulationInput.simulation_id == result.id)
    )
    assert input_count == len(result.changes)


def test_simulate_lowering_admissions_tends_to_reduce_risk(db_session) -> None:
    prediction = _seed_prediction_with_input(db_session, risk_percent=60.0)
    service = SimulationService(db_session, ml_registry)

    result = service.simulate(
        prediction.user_id,
        SimulateRequest(
            prediction_id=prediction.id,
            modifications=SimulateModifications(previous_admissions=0),
        ),
    )

    assert result.simulated_risk_percent <= result.original_risk_percent


def test_simulate_prediction_not_found_raises_404(db_session) -> None:
    service = SimulationService(db_session, ml_registry)

    with pytest.raises(HTTPException) as exc_info:
        service.simulate(
            uuid.uuid4(),
            SimulateRequest(
                prediction_id=uuid.uuid4(),
                modifications=SimulateModifications(glucose=120),
            ),
        )

    assert exc_info.value.status_code == 404


def test_simulate_ml_unavailable_raises_503() -> None:
    from unittest.mock import MagicMock

    registry = MagicMock()
    registry.is_ready = False
    registry.explainer_service = None
    registry.load_error = "ML unavailable"

    service = SimulationService(db=MagicMock(), registry=registry)
    with pytest.raises(HTTPException) as exc_info:
        service.simulate(
            uuid.uuid4(),
            SimulateRequest(
                prediction_id=uuid.uuid4(),
                modifications=SimulateModifications(glucose=120),
            ),
        )

    assert exc_info.value.status_code == 503


def test_simulate_modifications_schema_requires_change() -> None:
    with pytest.raises(ValueError, match="at least one"):
        SimulateModifications()
