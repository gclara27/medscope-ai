"""Simulation and SimulationInput model tests (T-116)."""

from decimal import Decimal

from sqlalchemy import select

from models.prediction import Prediction
from models.role import Role
from models.simulation import Simulation, SimulationInput
from models.user import User


def _create_user_and_prediction(db_session) -> tuple[User, Prediction]:
    role = Role(name="clinician")
    db_session.add(role)
    db_session.flush()
    user = User(
        role_id=role.id,
        first_name="Ana",
        last_name="García",
        email="clinician@medscope.ai",
        password_hash="$2b$12$hash",
    )
    db_session.add(user)
    db_session.flush()
    prediction = Prediction(
        user_id=user.id,
        risk_score=Decimal("72.50"),
        risk_level="high",
        model_version="rf-v1.0.0",
    )
    db_session.add(prediction)
    db_session.commit()
    return user, prediction


def test_simulation_create_with_fks(db_session) -> None:
    user, prediction = _create_user_and_prediction(db_session)
    simulation = Simulation(
        prediction_id=prediction.id,
        user_id=user.id,
        original_risk=Decimal("72.50"),
        simulated_risk=Decimal("58.00"),
        delta_risk=Decimal("-14.50"),
        simulation_summary="Reducing previous admissions lowers risk.",
    )
    db_session.add(simulation)
    db_session.commit()

    found = db_session.scalar(
        select(Simulation).where(Simulation.prediction_id == prediction.id)
    )
    assert found is not None
    assert found.delta_risk == Decimal("-14.50")
    assert found.simulated_risk == Decimal("58.00")


def test_simulation_input_multiple_per_simulation(db_session) -> None:
    user, prediction = _create_user_and_prediction(db_session)
    simulation = Simulation(
        prediction_id=prediction.id,
        user_id=user.id,
        original_risk=Decimal("65.00"),
        simulated_risk=Decimal("50.00"),
        delta_risk=Decimal("-15.00"),
    )
    db_session.add(simulation)
    db_session.flush()

    inputs = [
        SimulationInput(
            simulation_id=simulation.id,
            feature_name="previous_admissions",
            original_value="4",
            simulated_value="2",
        ),
        SimulationInput(
            simulation_id=simulation.id,
            feature_name="glucose",
            original_value="180",
            simulated_value="140",
        ),
    ]
    db_session.add_all(inputs)
    db_session.commit()

    db_session.refresh(simulation)
    assert len(simulation.simulation_inputs) == 2
    assert simulation.prediction.id == prediction.id
    assert simulation.user.id == user.id


def test_prediction_simulations_relationship(db_session) -> None:
    user, prediction = _create_user_and_prediction(db_session)
    simulation = Simulation(
        prediction_id=prediction.id,
        user_id=user.id,
        original_risk=Decimal("40.00"),
        simulated_risk=Decimal("35.00"),
        delta_risk=Decimal("-5.00"),
    )
    db_session.add(simulation)
    db_session.commit()

    db_session.refresh(prediction)
    assert len(prediction.simulations) == 1
    assert prediction.simulations[0].delta_risk == Decimal("-5.00")
