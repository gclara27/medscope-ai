"""Prediction routes — POST /predict (T-304, RBE-010)."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.database import get_db
from core.deps import get_ml_registry, require_roles
from core.ml_registry import MLRegistry
from models.user import User
from schemas.prediction import PredictRequest, PredictResponse
from services.prediction_service import PredictionService

router = APIRouter()

_PREDICT_ROLES = ("admin", "clinician", "nurse")


@router.post(
    "/predict",
    response_model=PredictResponse,
    summary="Generate readmission risk prediction with SHAP",
)
def predict(
    body: PredictRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*_PREDICT_ROLES)),
    registry: MLRegistry = Depends(get_ml_registry),
) -> PredictResponse:
    """Validate clinical input, run ML inference + SHAP, persist, and respond (UC-022–023)."""
    return PredictionService(db, registry).predict(current_user.id, body)
