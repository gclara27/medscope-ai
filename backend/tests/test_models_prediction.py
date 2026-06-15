"""Prediction model tests (T-113)."""

from decimal import Decimal

from sqlalchemy import select

from models.prediction import Prediction
from models.role import Role
from models.user import User


def _create_user(db_session, email: str = "clinician@medscope.ai") -> User:
    role = Role(name="clinician")
    db_session.add(role)
    db_session.flush()
    user = User(
        role_id=role.id,
        first_name="Ana",
        last_name="García",
        email=email,
        password_hash="$2b$12$hash",
    )
    db_session.add(user)
    db_session.commit()
    return user


def test_prediction_create_with_user_fk(db_session) -> None:
    user = _create_user(db_session)
    prediction = Prediction(
        user_id=user.id,
        risk_score=Decimal("72.50"),
        risk_level="high",
        confidence_score=Decimal("0.85"),
        summary="Elevated readmission risk based on clinical inputs.",
        model_version="rf-v1.0.0",
        prediction_time_ms=320,
    )
    db_session.add(prediction)
    db_session.commit()

    found = db_session.scalar(select(Prediction).where(Prediction.user_id == user.id))
    assert found is not None
    assert found.risk_score == Decimal("72.50")
    assert found.risk_level == "high"
    assert found.model_version == "rf-v1.0.0"
    assert found.prediction_time_ms == 320


def test_prediction_user_relationship(db_session) -> None:
    user = _create_user(db_session, email="analyst@medscope.ai")
    prediction = Prediction(
        user_id=user.id,
        risk_score=Decimal("25.00"),
        risk_level="low",
        model_version="lr-v1.0.0",
    )
    db_session.add(prediction)
    db_session.commit()

    db_session.refresh(user)
    assert len(user.predictions) == 1
    assert user.predictions[0].risk_level == "low"
    assert prediction.user.email == "analyst@medscope.ai"
