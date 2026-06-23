"""Analytics routes — GET /analytics (T-307, RBE-014)."""

from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.database import get_db
from core.deps import require_roles
from models.user import User
from schemas.analytics import AnalyticsResponse
from services.analytics_service import AnalyticsService

router = APIRouter()

_ANALYTICS_ROLES = ("admin", "analyst")


@router.get(
    "/analytics",
    response_model=AnalyticsResponse,
    summary="Aggregated prediction metrics for analytics dashboard",
)
def get_analytics(
    date_from: date | None = None,
    date_to: date | None = None,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_roles(*_ANALYTICS_ROLES)),
) -> AnalyticsResponse:
    """Return KPIs, risk distribution, and daily trends (UC-060–062)."""
    return AnalyticsService(db).get_analytics(date_from=date_from, date_to=date_to)
