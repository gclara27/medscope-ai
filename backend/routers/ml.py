"""ML metadata routes — GET /ml/models/comparison (T-X07-02, RBE-017, RF-077)."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from core.deps import require_roles
from models.user import User
from schemas.ml_comparison import ModelComparisonResponse, model_comparison_response_from_result
from services.ml_comparison_service import MLComparisonService

router = APIRouter(prefix="/ml", tags=["ml"])


def get_ml_comparison_service() -> MLComparisonService:
    """Dependency hook for tests and future configuration overrides."""
    return MLComparisonService()


@router.get(
    "/models/comparison",
    response_model=ModelComparisonResponse,
    summary="Offline ML model comparison metrics",
)
def get_model_comparison(
    _user: User = Depends(require_roles("analyst", "admin")),
    comparison_service: MLComparisonService = Depends(get_ml_comparison_service),
) -> ModelComparisonResponse:
    """Return offline training metrics for LR, RF, and XGBoost candidates (UC-084)."""
    result = comparison_service.get_comparison()
    return model_comparison_response_from_result(result)
