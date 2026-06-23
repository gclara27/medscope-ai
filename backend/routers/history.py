"""History routes — GET /history (T-306, RBE-012)."""

from __future__ import annotations

from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from core.database import get_db
from core.deps import require_roles
from models.user import User
from schemas.history import HistoryListResponse
from schemas.prediction import RiskLevel
from services.history_service import HistoryService

router = APIRouter()

_HISTORY_ROLES = ("admin", "clinician", "nurse", "analyst")


@router.get(
    "/history",
    response_model=HistoryListResponse,
    summary="List prediction history with optional filters",
)
def list_history(
    risk_level: RiskLevel | None = None,
    user_id: UUID | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_roles(*_HISTORY_ROLES)),
) -> HistoryListResponse:
    """Return paginated predictions filtered by date, risk level, or user (UC-050–051)."""
    return HistoryService(db).list_history(
        risk_level=risk_level,
        user_id=user_id,
        date_from=date_from,
        date_to=date_to,
        limit=limit,
        offset=offset,
    )
