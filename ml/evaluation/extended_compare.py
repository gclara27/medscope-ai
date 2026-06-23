"""Compare optional third baseline (XGBoost) with LR/RF (T-213)."""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from pathlib import Path

from ml.evaluation.compare import _METRIC_PRIORITY, _metric_value, select_baseline_winner
from ml.evaluation.metrics import ClassificationMetrics
from ml.training.constants import (
    LOGISTIC_REGRESSION_MODEL_ID,
    PRODUCTION_MODEL_ID,
    RANDOM_FOREST_MODEL_ID,
    XGBOOST_EVALUATION_PATH,
    XGBOOST_MODEL_ID,
)


def _winner_label(model_id: str) -> str:
    labels = {
        LOGISTIC_REGRESSION_MODEL_ID: "Logistic Regression",
        RANDOM_FOREST_MODEL_ID: "Random Forest",
        XGBOOST_MODEL_ID: "XGBoost",
    }
    return labels.get(model_id, model_id)


def select_best_recall_model(
    metrics_by_model: dict[str, ClassificationMetrics],
    *,
    primary_metric: str = "recall",
) -> str:
    """Pick the strongest model across LR, RF, and XGBoost."""
    if primary_metric not in _METRIC_PRIORITY:
        raise ValueError(f"Unsupported primary metric: {primary_metric}")

    ordered_metrics = (primary_metric,) + tuple(metric for metric in _METRIC_PRIORITY if metric != primary_metric)
    ranked = sorted(
        metrics_by_model.items(),
        key=lambda item: tuple(_metric_value(item[1], name) for name in ordered_metrics),
        reverse=True,
    )
    return ranked[0][0]


@dataclass(frozen=True)
class XGBoostEvaluationReport:
    logistic_regression: ClassificationMetrics
    random_forest: ClassificationMetrics
    xgboost: ClassificationMetrics
    primary_metric: str
    recall_winner: str
    production_model: str
    changes_production_model: bool
    summary: str
    rationale: tuple[str, ...]

    def to_dict(self) -> dict:
        return {
            "primary_metric": self.primary_metric,
            "recall_winner": self.recall_winner,
            "production_model": self.production_model,
            "changes_production_model": self.changes_production_model,
            "summary": self.summary,
            "rationale": list(self.rationale),
            "models": {
                LOGISTIC_REGRESSION_MODEL_ID: asdict(self.logistic_regression),
                RANDOM_FOREST_MODEL_ID: asdict(self.random_forest),
                XGBOOST_MODEL_ID: asdict(self.xgboost),
            },
        }


def build_xgboost_evaluation_report(
    logistic_metrics: ClassificationMetrics,
    random_forest_metrics: ClassificationMetrics,
    xgboost_metrics: ClassificationMetrics,
    *,
    primary_metric: str = "recall",
    production_model: str = PRODUCTION_MODEL_ID,
) -> XGBoostEvaluationReport:
    """Document how XGBoost compares without automatically replacing production."""
    metrics_by_model = {
        LOGISTIC_REGRESSION_MODEL_ID: logistic_metrics,
        RANDOM_FOREST_MODEL_ID: random_forest_metrics,
        XGBOOST_MODEL_ID: xgboost_metrics,
    }
    recall_winner = select_best_recall_model(metrics_by_model, primary_metric=primary_metric)
    changes_production = recall_winner != production_model

    lr_vs_rf = select_baseline_winner(logistic_metrics, random_forest_metrics, primary_metric=primary_metric)
    summary = (
        f"{_winner_label(recall_winner)} leads on {primary_metric} among LR/RF/XGBoost "
        f"(LR={_metric_value(logistic_metrics, primary_metric):.4f}, "
        f"RF={_metric_value(random_forest_metrics, primary_metric):.4f}, "
        f"XGB={_metric_value(xgboost_metrics, primary_metric):.4f})."
    )

    rationale: list[str] = [
        "XGBoost evaluated on the same stratified hold-out split as T-205/T-206 baselines.",
        f"Recall winner: {recall_winner}. Current LR vs RF winner remains {lr_vs_rf}.",
    ]
    if changes_production:
        rationale.append(
            f"XGBoost outperforms {production_model} on recall at threshold 0.5; "
            "manual promotion via T-208 would be required before replacing production artifacts."
        )
    else:
        rationale.append(
            f"Production model ({production_model}) remains the recall leader at threshold 0.5; "
            "no change to models/final/ or model.pkl."
        )

    return XGBoostEvaluationReport(
        logistic_regression=logistic_metrics,
        random_forest=random_forest_metrics,
        xgboost=xgboost_metrics,
        primary_metric=primary_metric,
        recall_winner=recall_winner,
        production_model=production_model,
        changes_production_model=changes_production,
        summary=summary,
        rationale=tuple(rationale),
    )


def save_xgboost_evaluation_report(
    report: XGBoostEvaluationReport,
    path: Path = XGBOOST_EVALUATION_PATH,
) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(report.to_dict(), indent=2), encoding="utf-8")
