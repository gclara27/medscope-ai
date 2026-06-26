"""Risk classification helpers using configurable thresholds (T-X02)."""

from __future__ import annotations


def classify_risk_level(score: float, *, high_threshold: float, medium_threshold: float) -> str:
    """Map a probability score to low, medium, or high using admin thresholds."""
    if score >= high_threshold:
        return "high"
    if score >= medium_threshold:
        return "medium"
    return "low"
