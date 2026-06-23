"""Map persisted prediction risk values to API response fields."""

from __future__ import annotations

from decimal import Decimal


def api_risk_from_stored_percent(stored_percent: float | Decimal) -> tuple[float, float]:
    """
    Convert DB `predictions.risk_score` (0-100 percent) to API scales.

    The ORM column is named `risk_score` but persistence stores percentage via
    `PredictionRepository.create_with_details(risk_score_percent=...)`.
    """
    risk_percent = float(stored_percent)
    return round(risk_percent / 100, 4), risk_percent
