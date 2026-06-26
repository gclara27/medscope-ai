"""Clinical dashboard aggregations (T-501, UC-010, RF-010–011)."""

from __future__ import annotations

from sqlalchemy.orm import Session

from repositories.analytics_repository import AnalyticsRepository
from schemas.analytics import RiskDistributionItem
from schemas.dashboard import DashboardKpis, DashboardResponse
from services.history_service import HistoryService

_RECENT_EVALUATIONS_LIMIT = 5
_HIGH_RISK_ALERTS_LIMIT = 5


class DashboardService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repository = AnalyticsRepository(db)

    def get_dashboard(self) -> DashboardResponse:
        snapshot = self.repository.fetch_dashboard_snapshot()
        history = HistoryService(self.db)
        recent = history.list_history(
            limit=_RECENT_EVALUATIONS_LIMIT,
            offset=0,
            include_total=False,
        )
        alerts = history.list_history(
            risk_level="high",
            limit=_HIGH_RISK_ALERTS_LIMIT,
            offset=0,
            include_total=False,
        )

        average_risk_percent = round(min(snapshot.average_risk or 0.0, 100.0), 2)
        distribution_rows = [
            (level, snapshot.buckets.get(level, 0)) for level in ("low", "medium", "high")
        ]

        return DashboardResponse(
            kpis=DashboardKpis(
                total_evaluations=snapshot.total,
                average_risk_percent=average_risk_percent,
                high_risk_count=snapshot.buckets.get("high", 0),
                low_risk_count=snapshot.buckets.get("low", 0),
                medium_risk_count=snapshot.buckets.get("medium", 0),
                evaluations_last_24h=snapshot.evaluations_last_24h,
            ),
            risk_distribution=self._build_distribution(distribution_rows, snapshot.total),
            recent_evaluations=recent.items,
            high_risk_alerts=alerts.items,
        )

    def _build_distribution(
        self,
        rows: list[tuple[str, int]],
        total: int,
    ) -> list[RiskDistributionItem]:
        items: list[RiskDistributionItem] = []
        for level, count in rows:
            percentage = round((count / total) * 100, 2) if total else 0.0
            items.append(
                RiskDistributionItem(
                    risk_level=level,  # type: ignore[arg-type]
                    count=count,
                    percentage=percentage,
                )
            )
        return items
