"""Dashboard routes — GET /dashboard (T-501, UC-010)."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.database import get_db
from core.deps import require_permission
from models.user import User
from schemas.dashboard import DashboardResponse
from services.dashboard_service import DashboardService

router = APIRouter()


@router.get(
    "/dashboard",
    response_model=DashboardResponse,
    summary="Clinical dashboard KPIs and risk overview",
)
def get_dashboard(
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_permission("dashboard")),
) -> DashboardResponse:
    """Return KPI cards data for the clinical dashboard (RF-010–011)."""
    return DashboardService(db).get_dashboard()
