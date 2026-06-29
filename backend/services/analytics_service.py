"""Analytics aggregations over predictions (T-307, UC-060–062)."""

from __future__ import annotations

from datetime import date

from fastapi import HTTPException, status

from core.api_errors import DATE_RANGE_INVALID
from sqlalchemy.orm import Session

from repositories.analytics_repository import AnalyticsRepository
from schemas.analytics import (
    AnalyticsResponse,
    AnalyticsSummary,
    RiskDistributionItem,
    TrendPoint,
)


class AnalyticsService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repository = AnalyticsRepository(db)

    def get_analytics(
        self,
        *,
        date_from: date | None = None,
        date_to: date | None = None,
    ) -> AnalyticsResponse:
        if date_from and date_to and date_from > date_to:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=DATE_RANGE_INVALID,
            )

        total, avg_risk, avg_time_ms, buckets = self.repository.fetch_summary(
            date_from=date_from,
            date_to=date_to,
        )
        trend_rows = self.repository.fetch_daily_trend(
            date_from=date_from,
            date_to=date_to,
        )

        return AnalyticsResponse(
            summary=AnalyticsSummary(
                total_predictions=total,
                average_risk_percent=round(avg_risk or 0.0, 2),
                high_risk_count=buckets.get("high", 0),
                medium_risk_count=buckets.get("medium", 0),
                low_risk_count=buckets.get("low", 0),
                average_prediction_time_ms=round(avg_time_ms, 2) if avg_time_ms is not None else None,
            ),
            risk_distribution=self._build_distribution_from_buckets(buckets, total),
            trend=[
                TrendPoint(
                    date=row.period,
                    count=row.count,
                    average_risk_percent=round(row.average_risk_percent, 2),
                )
                for row in trend_rows
            ],
            date_from=date_from,
            date_to=date_to,
        )

    def _build_distribution_from_buckets(
        self,
        buckets: dict[str, int],
        total: int,
    ) -> list[RiskDistributionItem]:
        items: list[RiskDistributionItem] = []
        for level in ("low", "medium", "high"):
            count = buckets.get(level, 0)
            percentage = round((count / total) * 100, 2) if total else 0.0
            items.append(
                RiskDistributionItem(
                    risk_level=level,  # type: ignore[arg-type]
                    count=count,
                    percentage=percentage,
                )
            )
        return items
