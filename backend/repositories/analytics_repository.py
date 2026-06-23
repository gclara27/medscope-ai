"""Analytics aggregations over predictions (T-307, RF-060–062)."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, date, datetime, time

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from models.prediction import Prediction


def _start_of_day(value: date) -> datetime:
    return datetime.combine(value, time.min, tzinfo=UTC)


def _end_of_day(value: date) -> datetime:
    return datetime.combine(value, time.max, tzinfo=UTC)


@dataclass(frozen=True)
class RiskBucketRow:
    risk_level: str
    count: int


@dataclass(frozen=True)
class TrendRow:
    period: date
    count: int
    average_risk_percent: float


class AnalyticsRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def _base_stmt(self, *, date_from: date | None, date_to: date | None):
        stmt = select(Prediction)
        if date_from is not None:
            stmt = stmt.where(Prediction.created_at >= _start_of_day(date_from))
        if date_to is not None:
            stmt = stmt.where(Prediction.created_at <= _end_of_day(date_to))
        return stmt

    def fetch_summary(
        self,
        *,
        date_from: date | None = None,
        date_to: date | None = None,
    ) -> tuple[int, float | None, float | None, dict[str, int]]:
        stmt = select(
            func.count(Prediction.id),
            func.avg(Prediction.risk_score),
            func.avg(Prediction.prediction_time_ms),
        )
        if date_from is not None:
            stmt = stmt.where(Prediction.created_at >= _start_of_day(date_from))
        if date_to is not None:
            stmt = stmt.where(Prediction.created_at <= _end_of_day(date_to))

        total, avg_risk, avg_time_ms = self.db.execute(stmt).one()
        total_int = int(total or 0)

        bucket_stmt = select(Prediction.risk_level, func.count()).group_by(Prediction.risk_level)
        if date_from is not None:
            bucket_stmt = bucket_stmt.where(Prediction.created_at >= _start_of_day(date_from))
        if date_to is not None:
            bucket_stmt = bucket_stmt.where(Prediction.created_at <= _end_of_day(date_to))

        buckets = {level: int(count) for level, count in self.db.execute(bucket_stmt).all()}

        return (
            total_int,
            float(avg_risk) if avg_risk is not None else None,
            float(avg_time_ms) if avg_time_ms is not None else None,
            buckets,
        )

    def fetch_risk_distribution(
        self,
        *,
        date_from: date | None = None,
        date_to: date | None = None,
    ) -> list[RiskBucketRow]:
        stmt = select(Prediction.risk_level, func.count()).group_by(Prediction.risk_level)
        if date_from is not None:
            stmt = stmt.where(Prediction.created_at >= _start_of_day(date_from))
        if date_to is not None:
            stmt = stmt.where(Prediction.created_at <= _end_of_day(date_to))

        rows = self.db.execute(stmt).all()
        return [RiskBucketRow(risk_level=level, count=int(count)) for level, count in rows]

    def fetch_daily_trend(
        self,
        *,
        date_from: date | None = None,
        date_to: date | None = None,
    ) -> list[TrendRow]:
        day_column = func.date(Prediction.created_at)
        stmt = (
            select(
                day_column,
                func.count(Prediction.id),
                func.avg(Prediction.risk_score),
            )
            .group_by(day_column)
            .order_by(day_column)
        )
        if date_from is not None:
            stmt = stmt.where(Prediction.created_at >= _start_of_day(date_from))
        if date_to is not None:
            stmt = stmt.where(Prediction.created_at <= _end_of_day(date_to))

        rows = self.db.execute(stmt).all()
        trend: list[TrendRow] = []
        for period, count, avg_risk in rows:
            if period is None:
                continue
            if isinstance(period, str):
                period_date = date.fromisoformat(period)
            else:
                period_date = period
            trend.append(
                TrendRow(
                    period=period_date,
                    count=int(count),
                    average_risk_percent=float(avg_risk or 0.0),
                )
            )
        return trend
