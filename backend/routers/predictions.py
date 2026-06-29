"""Prediction routes — POST /predict (T-304, RBE-010)."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.database import get_db
from core.deps import get_ml_registry, require_permission
from core.ml_registry import MLRegistry
from models.user import User
from schemas.prediction import PredictRequest, PredictResponse
from services.audit_service import AuditService
from services.prediction_service import PredictionService

router = APIRouter()


@router.post(
    "/predict",
    response_model=PredictResponse,
    summary="Generate readmission risk prediction with SHAP",
)
def predict(
    body: PredictRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("evaluation")),
    registry: MLRegistry = Depends(get_ml_registry),
) -> PredictResponse:
    """Validate clinical input, run ML inference + SHAP, persist, and respond (UC-022–023)."""
    response = PredictionService(db, registry).predict(current_user.id, body)
    AuditService(db).record_safely(
        action_type="prediction.create",
        user_id=current_user.id,
        entity_type="prediction",
        entity_id=response.id,
        action_details={
            "prediction_id": str(response.id),
            "model_version": response.model_version,
            "risk_level": response.risk_level,
        },
    )
    return response
