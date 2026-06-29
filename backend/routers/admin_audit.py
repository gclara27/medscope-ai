"""Admin audit log routes — RF-075, RBE-016, T-X06."""

from __future__ import annotations

from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from core.database import get_db
from core.deps import require_permission
from models.user import User
from schemas.admin_audit import AuditLogListResponse
from services.audit_service import AUDIT_ACTION_TYPES, AuditService

router = APIRouter()


@router.get(
    "/audit-logs",
    response_model=AuditLogListResponse,
    summary="List system audit logs",
)
def list_audit_logs(
    date_from: date | None = None,
    date_to: date | None = None,
    action_type: str | None = Query(
        default=None,
        description="Filter by action type (e.g. auth.login, prediction.create)",
    ),
    user_id: UUID | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    _admin: User = Depends(require_permission("settings")),
    db: Session = Depends(get_db),
) -> AuditLogListResponse:
    """Return paginated audit logs for administrators (UC-085, RF-075)."""
    if action_type is not None and action_type not in AUDIT_ACTION_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Unsupported action_type filter: {action_type}",
        )

    return AuditService(db).list_audit_logs(
        date_from=date_from,
        date_to=date_to,
        action_type=action_type,
        user_id=user_id,
        page=page,
        page_size=page_size,
    )
