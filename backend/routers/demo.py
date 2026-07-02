"""Public demo routes — ephemeral ML inference without authentication."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.database import get_db
from core.deps import get_ml_registry
from core.ml_registry import MLRegistry
from schemas.demo import DemoSimulateRequest
from schemas.prediction import PredictRequest, PredictResponse
from schemas.simulation import SimulateResponse
from services.demo_service import DemoService

router = APIRouter(prefix="/demo", tags=["demo"])


@router.post(
    "/predict",
    response_model=PredictResponse,
    summary="Demo prediction (no auth, no persistence)",
)
def demo_predict(
    body: PredictRequest,
    db: Session = Depends(get_db),
    registry: MLRegistry = Depends(get_ml_registry),
) -> PredictResponse:
    """Run readmission risk + SHAP for anonymous playground users."""
    return DemoService(db, registry).predict(body)


@router.post(
    "/simulate",
    response_model=SimulateResponse,
    summary="Demo simulation (no auth, no persistence)",
)
def demo_simulate(
    body: DemoSimulateRequest,
    db: Session = Depends(get_db),
    registry: MLRegistry = Depends(get_ml_registry),
) -> SimulateResponse:
    """Compare baseline vs modified clinical variables without storing records."""
    return DemoService(db, registry).simulate(body)
