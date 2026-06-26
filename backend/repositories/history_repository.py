"""Prediction history queries (T-306, RF-051)."""

from __future__ import annotations

from datetime import UTC, date, datetime, time
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from models.prediction import Prediction
from models.user import User


def _start_of_day(value: date) -> datetime:
    return datetime.combine(value, time.min, tzinfo=UTC)


def _end_of_day(value: date) -> datetime:
    return datetime.combine(value, time.max, tzinfo=UTC)


class HistoryRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def _apply_filters(
        self,
        stmt,
        *,
        risk_level: str | None,
        user_id: UUID | None,
        date_from: date | None,
        date_to: date | None,
    ):
        if risk_level is not None:
            stmt = stmt.where(Prediction.risk_level == risk_level)
        if user_id is not None:
            stmt = stmt.where(Prediction.user_id == user_id)
        if date_from is not None:
            stmt = stmt.where(Prediction.created_at >= _start_of_day(date_from))
        if date_to is not None:
            stmt = stmt.where(Prediction.created_at <= _end_of_day(date_to))
        return stmt

    def list_predictions(
        self,
        *,
        risk_level: str | None = None,
        user_id: UUID | None = None,
        date_from: date | None = None,
        date_to: date | None = None,
        limit: int = 50,
        offset: int = 0,
        include_total: bool = True,
    ) -> tuple[list[Prediction], int]:
        """Return predictions newest-first with optional RF-051 filters."""
        list_stmt = select(Prediction).options(
            joinedload(Prediction.user).joinedload(User.role),
            joinedload(Prediction.patient_input),
        )
        list_stmt = self._apply_filters(
            list_stmt,
            risk_level=risk_level,
            user_id=user_id,
            date_from=date_from,
            date_to=date_to,
        )

        total = 0
        if include_total:
            count_stmt = select(func.count()).select_from(Prediction)
            count_stmt = self._apply_filters(
                count_stmt,
                risk_level=risk_level,
                user_id=user_id,
                date_from=date_from,
                date_to=date_to,
            )
            total = int(self.db.scalar(count_stmt) or 0)

        rows = (
            self.db.scalars(list_stmt.order_by(Prediction.created_at.desc()).limit(limit).offset(offset)).unique().all()
        )

        return list(rows), total
