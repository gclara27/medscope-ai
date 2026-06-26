"""Dashboard response schemas (T-501, RF-010–011, UC-010)."""

from __future__ import annotations

from pydantic import BaseModel, Field

from schemas.analytics import RiskDistributionItem
from schemas.history import HistoryListItem


class DashboardKpis(BaseModel):
    """Clinical dashboard KPI cards (RF-011)."""

    total_evaluations: int = Field(ge=0)
    average_risk_percent: float = Field(ge=0.0, le=100.0)
    high_risk_count: int = Field(ge=0, description="High-risk patients / estimated readmissions")
    low_risk_count: int = Field(ge=0, description="Stable low-risk evaluations")
    medium_risk_count: int = Field(ge=0)
    evaluations_last_24h: int = Field(ge=0)


class DashboardResponse(BaseModel):
    """Clinical dashboard overview payload (UC-010)."""

    kpis: DashboardKpis
    risk_distribution: list[RiskDistributionItem]
    recent_evaluations: list[HistoryListItem] = Field(
        default_factory=list,
        description="Latest stored predictions (RF-010)",
    )
    high_risk_alerts: list[HistoryListItem] = Field(
        default_factory=list,
        description="Recent high-risk evaluations requiring review (RF-010)",
    )
