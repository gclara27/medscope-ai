"""Offline ML model comparison — read training artifacts (T-X07-01, RIA-040)."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from core.paths import MODELS_DIR

OFFLINE_COMPARISON_NOTE = (
    "Metrics come from offline training evaluation. Production inference uses the single "
    "model loaded at API startup (ml_registry)."
)

MODEL_CATALOG: tuple[tuple[str, str, str | None], ...] = (
    ("logistic_regression", "Logistic Regression", "1.0.0"),
    ("random_forest", "Random Forest", "1.0.0"),
    ("xgboost", "XGBoost", "1.0.0"),
)


@dataclass(frozen=True)
class ModelMetricsSnapshot:
    accuracy: float
    recall: float
    precision: float
    f1: float
    roc_auc: float


@dataclass(frozen=True)
class ModelComparisonItem:
    model_id: str
    display_name: str
    version: str | None
    is_production: bool
    metrics: ModelMetricsSnapshot | None
    available: bool


@dataclass(frozen=True)
class ModelComparisonResult:
    """Unified offline comparison payload for API/UI (RF-076, RF-077)."""

    is_available: bool
    primary_metric: str
    recall_winner: str | None
    baseline_winner: str | None
    production_model_id: str | None
    production_model_version: str | None
    summary: str | None
    rationale: tuple[str, ...]
    offline_note: str
    missing_artifacts: tuple[str, ...]
    models: tuple[ModelComparisonItem, ...]


def _load_json(path: Path) -> dict[str, Any] | None:
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def _parse_metrics(raw: dict[str, Any] | None) -> ModelMetricsSnapshot | None:
    if not raw:
        return None
    required = ("accuracy", "recall", "precision", "f1", "roc_auc")
    if not all(key in raw for key in required):
        return None
    return ModelMetricsSnapshot(
        accuracy=float(raw["accuracy"]),
        recall=float(raw["recall"]),
        precision=float(raw["precision"]),
        f1=float(raw["f1"]),
        roc_auc=float(raw["roc_auc"]),
    )


class MLComparisonService:
    """Read-only access to baseline and extended ML evaluation artifacts."""

    def __init__(self, models_dir: Path | None = None) -> None:
        self.models_dir = models_dir or MODELS_DIR

    def get_comparison(self) -> ModelComparisonResult:
        """Load and merge manifest, baseline comparison, and optional XGBoost report."""
        manifest_path = self.models_dir / "model_manifest.json"
        baseline_path = self.models_dir / "baseline_comparison.json"
        xgboost_path = self.models_dir / "xgboost_evaluation.json"

        missing: list[str] = []
        manifest = _load_json(manifest_path)
        baseline = _load_json(baseline_path)
        xgboost = _load_json(xgboost_path)

        if manifest is None:
            missing.append("model_manifest.json")
        if baseline is None:
            missing.append("baseline_comparison.json")

        production_model_id = manifest.get("model_id") if manifest else None
        production_model_version = manifest.get("model_version") if manifest else None

        if production_model_id is None and xgboost is not None:
            production_model_id = xgboost.get("production_model")

        metrics_by_model: dict[str, dict[str, Any]] = {}
        primary_metric = "recall"
        recall_winner: str | None = None
        baseline_winner: str | None = None
        summary: str | None = None
        rationale: tuple[str, ...] = ()

        if xgboost is not None and isinstance(xgboost.get("models"), dict):
            metrics_by_model = {
                str(model_id): metrics
                for model_id, metrics in xgboost["models"].items()
                if isinstance(metrics, dict)
            }
            primary_metric = str(xgboost.get("primary_metric", primary_metric))
            recall_winner = xgboost.get("recall_winner")
            summary = xgboost.get("summary")
            rationale = tuple(xgboost.get("rationale", []))
        elif baseline is not None:
            metrics_by_model = {
                "logistic_regression": baseline.get("logistic_regression", {}),
                "random_forest": baseline.get("random_forest", {}),
            }
            primary_metric = str(baseline.get("primary_metric", primary_metric))
            recall_winner = baseline.get("winner")
            summary = baseline.get("summary")

        baseline_winner = baseline.get("winner") if baseline is not None else None
        if recall_winner is None:
            recall_winner = baseline_winner

        models: list[ModelComparisonItem] = []
        for model_id, display_name, default_version in MODEL_CATALOG:
            raw_metrics = metrics_by_model.get(model_id)
            parsed_metrics = _parse_metrics(raw_metrics if isinstance(raw_metrics, dict) else None)
            models.append(
                ModelComparisonItem(
                    model_id=model_id,
                    display_name=display_name,
                    version=production_model_version if model_id == production_model_id else default_version,
                    is_production=model_id == production_model_id,
                    metrics=parsed_metrics,
                    available=parsed_metrics is not None,
                ),
            )

        is_available = bool(metrics_by_model) and production_model_id is not None

        return ModelComparisonResult(
            is_available=is_available,
            primary_metric=primary_metric,
            recall_winner=recall_winner,
            baseline_winner=baseline_winner,
            production_model_id=production_model_id,
            production_model_version=production_model_version,
            summary=summary,
            rationale=rationale,
            offline_note=OFFLINE_COMPARISON_NOTE,
            missing_artifacts=tuple(missing),
            models=tuple(models),
        )
