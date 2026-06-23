"""Compare baseline model metrics (T-206)."""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from pathlib import Path

from ml.evaluation.metrics import ClassificationMetrics
from ml.training.constants import (
    BASELINE_COMPARISON_PATH,
    LOGISTIC_REGRESSION_MODEL_ID,
    RANDOM_FOREST_MODEL_ID,
)

_METRIC_PRIORITY = ("recall", "f1", "roc_auc", "accuracy")


@dataclass(frozen=True)
class BaselineComparison:
    logistic_regression: ClassificationMetrics
    random_forest: ClassificationMetrics
    primary_metric: str
    winner: str
    summary: str

    def to_dict(self) -> dict:
        return {
            "primary_metric": self.primary_metric,
            "winner": self.winner,
            "summary": self.summary,
            "logistic_regression": asdict(self.logistic_regression),
            "random_forest": asdict(self.random_forest),
        }


def _metric_value(metrics: ClassificationMetrics, metric_name: str) -> float:
    return getattr(metrics, metric_name)


def select_baseline_winner(
    logistic_metrics: ClassificationMetrics,
    random_forest_metrics: ClassificationMetrics,
    *,
    primary_metric: str = "recall",
) -> str:
    """Pick the stronger baseline; recall is the healthcare priority (EP-2.7)."""
    if primary_metric not in _METRIC_PRIORITY:
        raise ValueError(f"Unsupported primary metric: {primary_metric}")

    ordered_metrics = (primary_metric,) + tuple(metric for metric in _METRIC_PRIORITY if metric != primary_metric)

    lr_scores = tuple(_metric_value(logistic_metrics, name) for name in ordered_metrics)
    rf_scores = tuple(_metric_value(random_forest_metrics, name) for name in ordered_metrics)

    if rf_scores > lr_scores:
        return RANDOM_FOREST_MODEL_ID
    if lr_scores > rf_scores:
        return LOGISTIC_REGRESSION_MODEL_ID
    return RANDOM_FOREST_MODEL_ID


def compare_baselines(
    logistic_metrics: ClassificationMetrics,
    random_forest_metrics: ClassificationMetrics,
    *,
    primary_metric: str = "recall",
) -> BaselineComparison:
    winner = select_baseline_winner(
        logistic_metrics,
        random_forest_metrics,
        primary_metric=primary_metric,
    )
    winner_label = "Random Forest" if winner == RANDOM_FOREST_MODEL_ID else "Logistic Regression"
    summary = (
        f"{winner_label} wins on {primary_metric} "
        f"(LR={_metric_value(logistic_metrics, primary_metric):.4f}, "
        f"RF={_metric_value(random_forest_metrics, primary_metric):.4f})."
    )
    return BaselineComparison(
        logistic_regression=logistic_metrics,
        random_forest=random_forest_metrics,
        primary_metric=primary_metric,
        winner=winner,
        summary=summary,
    )


def save_baseline_comparison(
    comparison: BaselineComparison,
    path: Path = BASELINE_COMPARISON_PATH,
) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(comparison.to_dict(), indent=2), encoding="utf-8")
