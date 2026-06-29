"""Audit trail business logic — UC-081, T-X06."""

from __future__ import annotations

import logging
from datetime import date
from typing import Any
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from core.api_errors import DATE_RANGE_INVALID
from models.audit_log import AuditLog
from repositories.audit_log_repository import AuditLogRepository
from schemas.admin_audit import AuditLogListItem, AuditLogListResponse, AuditLogUserSummary

logger = logging.getLogger(__name__)

AUDIT_ACTION_TYPES: frozenset[str] = frozenset(
    {
        "auth.login",
        "auth.logout",
        "prediction.create",
        "simulation.create",
        "admin.user.create",
        "admin.user.update",
        "admin.role.update",
        "admin.settings.update",
    },
)

FORBIDDEN_AUDIT_DETAIL_KEYS: frozenset[str] = frozenset(
    {
        "password",
        "password_hash",
        "new_password",
        "old_password",
        "access_token",
        "refresh_token",
        "age",
        "gender",
        "glucose",
        "blood_pressure",
        "bmi",
        "medications_count",
        "previous_admissions",
        "hospital_stay_days",
        "patient_input",
        "feature_name",
        "feature_value",
        "shap_value",
        "first_name",
        "last_name",
    },
)


def sanitize_action_details(details: dict[str, Any] | None) -> dict[str, Any] | None:
    """Remove PHI, credentials, and clinical values from audit metadata (RNF-053)."""
    if not details:
        return None

    sanitized: dict[str, Any] = {}
    for key, value in details.items():
        lower_key = key.lower()
        if lower_key in FORBIDDEN_AUDIT_DETAIL_KEYS or "password" in lower_key:
            continue
        if isinstance(value, dict):
            nested = sanitize_action_details(value)
            if nested:
                sanitized[key] = nested
            continue
        if isinstance(value, list):
            sanitized_list: list[Any] = []
            for item in value:
                if isinstance(item, dict):
                    nested_item = sanitize_action_details(item)
                    if nested_item:
                        sanitized_list.append(nested_item)
                else:
                    sanitized_list.append(item)
            if sanitized_list:
                sanitized[key] = sanitized_list
            continue
        sanitized[key] = value

    return sanitized or None


class AuditService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repository = AuditLogRepository(db)

    def record(
        self,
        *,
        action_type: str,
        user_id: UUID | None = None,
        entity_type: str | None = None,
        entity_id: UUID | None = None,
        action_details: dict[str, Any] | None = None,
    ) -> AuditLog:
        """Persist a critical action audit event without PHI in action_details."""
        if action_type not in AUDIT_ACTION_TYPES:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Unsupported audit action_type: {action_type}",
            )

        return self.repository.create(
            user_id=user_id,
            action_type=action_type,
            entity_type=entity_type,
            entity_id=entity_id,
            action_details=sanitize_action_details(action_details),
        )

    def record_safely(
        self,
        *,
        action_type: str,
        user_id: UUID | None = None,
        entity_type: str | None = None,
        entity_id: UUID | None = None,
        action_details: dict[str, Any] | None = None,
    ) -> None:
        """Best-effort audit write — failures are logged but do not break the main flow."""
        try:
            self.record(
                action_type=action_type,
                user_id=user_id,
                entity_type=entity_type,
                entity_id=entity_id,
                action_details=action_details,
            )
        except Exception:
            logger.exception("Failed to persist audit log for action %s", action_type)

    def list_audit_logs(
        self,
        *,
        date_from: date | None = None,
        date_to: date | None = None,
        action_type: str | None = None,
        user_id: UUID | None = None,
        page: int = 1,
        page_size: int = 50,
    ) -> AuditLogListResponse:
        """Return paginated audit logs for admin review (RF-075, UC-085)."""
        if date_from and date_to and date_from > date_to:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=DATE_RANGE_INVALID,
            )

        offset = (page - 1) * page_size
        rows, total = self.repository.list_audit_logs(
            date_from=date_from,
            date_to=date_to,
            action_type=action_type,
            user_id=user_id,
            limit=page_size,
            offset=offset,
        )

        return AuditLogListResponse(
            items=[self._to_list_item(row) for row in rows],
            total=total,
            page=page,
            page_size=page_size,
        )

    def _to_list_item(self, log: AuditLog) -> AuditLogListItem:
        user_summary = None
        if log.user is not None:
            user_summary = AuditLogUserSummary(
                id=log.user.id,
                email=log.user.email,
                first_name=log.user.first_name,
                last_name=log.user.last_name,
                role=log.user.role.name,
            )

        return AuditLogListItem(
            id=log.id,
            user_id=log.user_id,
            action_type=log.action_type,
            entity_type=log.entity_type,
            entity_id=log.entity_id,
            action_details=log.action_details,
            created_at=log.created_at,
            user=user_summary,
        )
