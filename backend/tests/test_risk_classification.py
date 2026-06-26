"""Risk classification unit tests — T-X02."""

from services.risk_classification import classify_risk_level


def test_classify_risk_level_uses_configurable_thresholds() -> None:
    assert classify_risk_level(0.6, high_threshold=0.5, medium_threshold=0.35) == "high"
    assert classify_risk_level(0.4, high_threshold=0.5, medium_threshold=0.35) == "medium"
    assert classify_risk_level(0.2, high_threshold=0.5, medium_threshold=0.35) == "low"
