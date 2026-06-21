"""ShapExplanation model tests (T-115)."""

from decimal import Decimal

from sqlalchemy import select

from models.prediction import Prediction
from models.role import Role
from models.shap_explanation import ShapExplanation
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
        risk_score=Decimal("72.50"),
        risk_level="high",
        model_version="rf-v1.0.0",
    )
    db_session.add(prediction)
    db_session.commit()
    return prediction


def test_shap_explanation_create_multiple_per_prediction(db_session) -> None:
    prediction = _create_prediction(db_session)
    explanations = [
        ShapExplanation(
            prediction_id=prediction.id,
            feature_name="previous_admissions",
            feature_value="4",
            shap_value=Decimal("0.15230"),
            direction="increases_risk",
            impact_direction="positive",
            importance_rank=1,
        ),
        ShapExplanation(
            prediction_id=prediction.id,
            feature_name="glucose",
            feature_value="180.0",
            shap_value=Decimal("-0.08450"),
            direction="decreases_risk",
            impact_direction="negative",
            importance_rank=2,
        ),
    ]
    db_session.add_all(explanations)
    db_session.commit()

    found = db_session.scalars(
        select(ShapExplanation)
        .where(ShapExplanation.prediction_id == prediction.id)
        .order_by(ShapExplanation.importance_rank)
    ).all()
    assert len(found) == 2
    assert found[0].feature_name == "previous_admissions"
    assert found[0].shap_value == Decimal("0.15230")
    assert found[1].importance_rank == 2


def test_shap_explanation_prediction_relationship(db_session) -> None:
    prediction = _create_prediction(db_session)
    shap = ShapExplanation(
        prediction_id=prediction.id,
        feature_name="age",
        feature_value="65",
        shap_value=Decimal("0.05000"),
        importance_rank=1,
    )
    db_session.add(shap)
    db_session.commit()

    db_session.refresh(prediction)
    assert len(prediction.shap_explanations) == 1
    assert prediction.shap_explanations[0].feature_name == "age"
    assert shap.prediction.id == prediction.id
