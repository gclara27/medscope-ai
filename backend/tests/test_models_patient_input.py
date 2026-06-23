"""PatientInput model tests (T-114)."""

from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from models.patient_input import PatientInput
from models.prediction import Prediction
from models.role import Role
from models.user import User


def _create_prediction(db_session) -> Prediction:
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
        risk_score=Decimal("65.00"),
        risk_level="medium",
        model_version="rf-v1.0.0",
    )
    db_session.add(prediction)
    db_session.commit()
    return prediction


def test_patient_input_create_one_to_one(db_session) -> None:
    prediction = _create_prediction(db_session)
    patient_input = PatientInput(
        prediction_id=prediction.id,
        age=65,
        gender="female",
        glucose=Decimal("140.50"),
        blood_pressure=Decimal("120.00"),
        medications_count=3,
        previous_admissions=2,
        hospital_stay_days=5,
        bmi=Decimal("28.40"),
    )
    db_session.add(patient_input)
    db_session.commit()

    found = db_session.scalar(select(PatientInput).where(PatientInput.prediction_id == prediction.id))
    assert found is not None
    assert found.age == 65
    assert found.glucose == Decimal("140.50")
    assert found.previous_admissions == 2


def test_patient_input_prediction_relationship(db_session) -> None:
    prediction = _create_prediction(db_session)
    patient_input = PatientInput(
        prediction_id=prediction.id,
        age=72,
        glucose=Decimal("180.00"),
        previous_admissions=4,
    )
    db_session.add(patient_input)
    db_session.commit()

    db_session.refresh(prediction)
    assert prediction.patient_input.age == 72
    assert patient_input.prediction.id == prediction.id


def test_patient_input_unique_per_prediction(db_session) -> None:
    prediction = _create_prediction(db_session)
    db_session.add(PatientInput(prediction_id=prediction.id, age=60))
    db_session.commit()

    db_session.add(PatientInput(prediction_id=prediction.id, age=61))
    try:
        db_session.commit()
        raise AssertionError("Expected IntegrityError for duplicate prediction_id")
    except IntegrityError:
        db_session.rollback()
