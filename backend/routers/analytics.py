"""Analytics routes — GET /analytics (T-307, RBE-014)."""

from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session

from core.database import get_db
from core.deps import require_permission
from models.user import User
from schemas.analytics import AnalyticsResponse
from services.analytics_pdf_service import build_analytics_pdf
from services.analytics_service import AnalyticsService

router = APIRouter()


def _analytics_export_filename(date_from: date | None, date_to: date | None) -> str:
    if date_to:
        return f"medscope-analytics-{date_to.isoformat()}.pdf"
    if date_from:
        return f"medscope-analytics-from-{date_from.isoformat()}.pdf"
    return "medscope-analytics-report.pdf"


@router.get(
    "/analytics/export.pdf",
    summary="Export analytics dashboard as PDF",
    response_class=Response,
)
def export_analytics_pdf(
    date_from: date | None = None,
    date_to: date | None = None,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_permission("analytics")),
) -> Response:
    """Generate a downloadable analytics report for the selected period (UC-063)."""
    analytics = AnalyticsService(db).get_analytics(date_from=date_from, date_to=date_to)
    pdf_bytes = build_analytics_pdf(analytics)
    filename = _analytics_export_filename(date_from, date_to)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get(
    "/analytics",
    response_model=AnalyticsResponse,
    summary="Aggregated prediction metrics for analytics dashboard",
)
def get_analytics(
    date_from: date | None = None,
    date_to: date | None = None,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_permission("analytics")),
) -> AnalyticsResponse:
    """Return KPIs, risk distribution, and daily trends (UC-060–062)."""
    return AnalyticsService(db).get_analytics(date_from=date_from, date_to=date_to)
