"""Audit log persistence — UC-081, T-X06."""

from __future__ import annotations

from datetime import UTC, date, datetime, time
from typing import Any
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from models.audit_log import AuditLog
from models.user import User


def _start_of_day(value: date) -> datetime:
    return datetime.combine(value, time.min, tzinfo=UTC)


def _end_of_day(value: date) -> datetime:
    return datetime.combine(value, time.max, tzinfo=UTC)


class AuditLogRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(
        self,
        *,
        action_type: str,
        user_id: UUID | None = None,
        entity_type: str | None = None,
        entity_id: UUID | None = None,
        action_details: dict[str, Any] | None = None,
    ) -> AuditLog:
        """Persist a single audit event (RNF-053: no PHI in action_details)."""
        log = AuditLog(
            user_id=user_id,
            action_type=action_type,
            entity_type=entity_type,
            entity_id=entity_id,
            action_details=action_details,
        )
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log

    def get_by_id(self, audit_log_id: UUID) -> AuditLog | None:
        return self.db.scalar(
            select(AuditLog)
            .options(joinedload(AuditLog.user).joinedload(User.role))
            .where(AuditLog.id == audit_log_id),
        )

    def _apply_filters(
        self,
        stmt,
        *,
        date_from: date | None,
        date_to: date | None,
        action_type: str | None,
        user_id: UUID | None,
    ):
        if action_type is not None:
            stmt = stmt.where(AuditLog.action_type == action_type)
        if user_id is not None:
            stmt = stmt.where(AuditLog.user_id == user_id)
        if date_from is not None:
            stmt = stmt.where(AuditLog.created_at >= _start_of_day(date_from))
        if date_to is not None:
            stmt = stmt.where(AuditLog.created_at <= _end_of_day(date_to))
        return stmt

    def list_audit_logs(
        self,
        *,
        date_from: date | None = None,
        date_to: date | None = None,
        action_type: str | None = None,
        user_id: UUID | None = None,
        limit: int = 50,
        offset: int = 0,
        include_total: bool = True,
    ) -> tuple[list[AuditLog], int]:
        """Return audit logs newest-first with optional filters (RBE-016)."""
        list_stmt = select(AuditLog).options(joinedload(AuditLog.user).joinedload(User.role))
        list_stmt = self._apply_filters(
            list_stmt,
            date_from=date_from,
            date_to=date_to,
            action_type=action_type,
            user_id=user_id,
        )

        total = 0
        if include_total:
            count_stmt = select(func.count()).select_from(AuditLog)
            count_stmt = self._apply_filters(
                count_stmt,
                date_from=date_from,
                date_to=date_to,
                action_type=action_type,
                user_id=user_id,
            )
            total = int(self.db.scalar(count_stmt) or 0)

        rows = (
            self.db.scalars(
                list_stmt.order_by(AuditLog.created_at.desc()).limit(limit).offset(offset),
            )
            .unique()
            .all()
        )
        return list(rows), total
