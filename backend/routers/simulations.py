"""Simulation routes — POST /simulate (T-305, RBE-011)."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.database import get_db
from core.deps import get_ml_registry, require_permission
from core.ml_registry import MLRegistry
from models.user import User
from schemas.simulation import SimulateRequest, SimulateResponse
from services.simulation_service import SimulationService

router = APIRouter()


@router.post(
    "/simulate",
    response_model=SimulateResponse,
    summary="Run what-if simulation against a stored prediction",
)
def simulate(
    body: SimulateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("simulation")),
    registry: MLRegistry = Depends(get_ml_registry),
) -> SimulateResponse:
    """Apply clinical overrides, recalculate risk, persist, and compare (UC-040–044)."""
    return SimulationService(db, registry).simulate(current_user.id, body)
