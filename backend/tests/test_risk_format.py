"""Risk format helper tests."""

from decimal import Decimal

from services.risk_format import api_risk_from_stored_percent


def test_api_risk_from_stored_percent_converts_db_percentage() -> None:
    risk_score, risk_percent = api_risk_from_stored_percent(Decimal("72.50"))

    assert risk_score == 0.725
    assert risk_percent == 72.5
