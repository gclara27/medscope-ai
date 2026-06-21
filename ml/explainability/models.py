"""SHAP explanation data structures (UC-030, RF-030)."""

from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any


def _json_safe(value: Any) -> Any:
    if hasattr(value, "item"):
        return value.item()
    return value


@dataclass(frozen=True)
class ShapFeatureContribution:
    feature_name: str
    feature_value: str | float | int | bool
    shap_value: float
    importance_rank: int
    direction: str

    def to_dict(self) -> dict[str, Any]:
        payload = asdict(self)
        payload["feature_value"] = _json_safe(self.feature_value)
        return payload


@dataclass(frozen=True)
class ShapExplanationResult:
    risk_score: float
    risk_level: str
    model_id: str
    model_version: str
    production_threshold: float
    contributions: tuple[ShapFeatureContribution, ...]
    summary: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "risk_score": self.risk_score,
            "risk_level": self.risk_level,
            "model_id": self.model_id,
            "model_version": self.model_version,
            "production_threshold": self.production_threshold,
            "contributions": [item.to_dict() for item in self.contributions],
            "summary": self.summary,
        }

    @property
    def top_contributions(self) -> tuple[ShapFeatureContribution, ...]:
        return self.contributions

    @property
    def risk_increasing_factors(self) -> tuple[ShapFeatureContribution, ...]:
        return tuple(item for item in self.contributions if item.shap_value > 0)

    @property
    def risk_decreasing_factors(self) -> tuple[ShapFeatureContribution, ...]:
        return tuple(item for item in self.contributions if item.shap_value < 0)
