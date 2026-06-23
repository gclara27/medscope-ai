"""Analytics response schemas (T-307, RF-060–062, UC-060–062)."""

from __future__ import annotations

from datetime import date

from pydantic import BaseModel, Field

from schemas.prediction import RiskLevel


class AnalyticsSummary(BaseModel):
    """Executive KPIs over filtered predictions (RF-062)."""

    total_predictions: int = Field(ge=0)
    average_risk_percent: float = Field(ge=0.0, le=100.0)
    high_risk_count: int = Field(ge=0)
    medium_risk_count: int = Field(ge=0)
    low_risk_count: int = Field(ge=0)
    average_prediction_time_ms: float | None = Field(default=None, ge=0.0)


class RiskDistributionItem(BaseModel):
    """Population risk bucket for charts (UC-062)."""

    risk_level: RiskLevel
    count: int = Field(ge=0)
    percentage: float = Field(ge=0.0, le=100.0)


class TrendPoint(BaseModel):
    """Daily prediction volume and average risk (UC-061)."""

    date: date
    count: int = Field(ge=0)
    average_risk_percent: float = Field(ge=0.0, le=100.0)


class AnalyticsResponse(BaseModel):
    """Aggregated analytics payload for dashboard charts (RF-060)."""

    summary: AnalyticsSummary
    risk_distribution: list[RiskDistributionItem]
    trend: list[TrendPoint]
    date_from: date | None = None
    date_to: date | None = None
