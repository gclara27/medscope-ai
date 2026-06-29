"""Simulation routes — POST /simulate (T-305, RBE-011)."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.database import get_db
from core.deps import get_ml_registry, require_permission
from core.ml_registry import MLRegistry
from models.user import User
from schemas.simulation import SimulateRequest, SimulateResponse
from services.audit_service import AuditService
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
    response = SimulationService(db, registry).simulate(current_user.id, body)
    AuditService(db).record_safely(
        action_type="simulation.create",
        user_id=current_user.id,
        entity_type="simulation",
        entity_id=response.id,
        action_details={
            "simulation_id": str(response.id),
            "prediction_id": str(response.prediction_id),
            "model_version": response.model_version,
        },
    )
    return response
