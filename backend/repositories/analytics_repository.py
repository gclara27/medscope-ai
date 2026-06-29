"""Analytics aggregations over predictions (T-307, RF-060–062)."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, date, datetime, time, timedelta

from sqlalchemy import case, func, select
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


@dataclass(frozen=True)
class DashboardAggregateSnapshot:
    total: int
    average_risk: float | None
    evaluations_last_24h: int
    buckets: dict[str, int]


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
        """Summary KPIs and risk buckets in a single table scan (T-703, RNF-002)."""
        stmt = select(
            func.count(Prediction.id),
            func.avg(Prediction.risk_score),
            func.avg(Prediction.prediction_time_ms),
            func.sum(case((Prediction.risk_level == "low", 1), else_=0)),
            func.sum(case((Prediction.risk_level == "medium", 1), else_=0)),
            func.sum(case((Prediction.risk_level == "high", 1), else_=0)),
        )
        if date_from is not None:
            stmt = stmt.where(Prediction.created_at >= _start_of_day(date_from))
        if date_to is not None:
            stmt = stmt.where(Prediction.created_at <= _end_of_day(date_to))

        total, avg_risk, avg_time_ms, low_count, medium_count, high_count = self.db.execute(stmt).one()
        buckets = {
            "low": int(low_count or 0),
            "medium": int(medium_count or 0),
            "high": int(high_count or 0),
        }

        return (
            int(total or 0),
            float(avg_risk) if avg_risk is not None else None,
            float(avg_time_ms) if avg_time_ms is not None else None,
            buckets,
        )

    def fetch_dashboard_snapshot(self) -> DashboardAggregateSnapshot:
        """Single-pass dashboard aggregates (T-504, RNF-002)."""
        since_24h = datetime.now(UTC) - timedelta(hours=24)
        summary_stmt = select(
            func.count(Prediction.id),
            func.avg(Prediction.risk_score),
            func.sum(case((Prediction.created_at >= since_24h, 1), else_=0)),
        )
        total, avg_risk, last_24h = self.db.execute(summary_stmt).one()

        bucket_stmt = select(Prediction.risk_level, func.count()).group_by(Prediction.risk_level)
        buckets = {level: int(count) for level, count in self.db.execute(bucket_stmt).all()}

        return DashboardAggregateSnapshot(
            total=int(total or 0),
            average_risk=float(avg_risk) if avg_risk is not None else None,
            evaluations_last_24h=int(last_24h or 0),
            buckets=buckets,
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
