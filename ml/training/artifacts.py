"""Persist and load trained model artifacts."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import joblib

from ml.evaluation.metrics import ClassificationMetrics
from ml.preprocessing.pipeline import Diabetes130Preprocessor
from ml.training.constants import (
    LOGISTIC_REGRESSION_METRICS_PATH,
    LOGISTIC_REGRESSION_MODEL_PATH,
    LOGISTIC_REGRESSION_PREPROCESSOR_PATH,
    RANDOM_FOREST_METRICS_PATH,
    RANDOM_FOREST_MODEL_PATH,
    RANDOM_FOREST_PREPROCESSOR_PATH,
    XGBOOST_METRICS_PATH,
    XGBOOST_MODEL_PATH,
    XGBOOST_PREPROCESSOR_PATH,
)


@dataclass(frozen=True)
class TrainingArtifacts:
    model: Any
    preprocessor: Diabetes130Preprocessor
    metrics: ClassificationMetrics
    model_id: str
    model_version: str


def _write_metrics_file(artifacts: TrainingArtifacts, metrics_path: Path) -> None:
    metrics_path.write_text(
        json.dumps(
            {
                "model_id": artifacts.model_id,
                "model_version": artifacts.model_version,
                "metrics": artifacts.metrics.to_dict(),
            },
            indent=2,
        ),
        encoding="utf-8",
    )


def save_model_artifacts(
    artifacts: TrainingArtifacts,
    *,
    model_path: Path,
    preprocessor_path: Path,
    metrics_path: Path,
) -> None:
    """Serialize model, preprocessor, and metrics with joblib/json."""
    model_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(artifacts.model, model_path)
    joblib.dump(artifacts.preprocessor, preprocessor_path)
    _write_metrics_file(artifacts, metrics_path)


def load_model_artifacts(
    *,
    model_path: Path,
    preprocessor_path: Path,
) -> tuple[Any, Diabetes130Preprocessor]:
    model = joblib.load(model_path)
    preprocessor = joblib.load(preprocessor_path)
    return model, preprocessor


def save_logistic_regression_artifacts(
    artifacts: TrainingArtifacts,
    *,
    model_path: Path = LOGISTIC_REGRESSION_MODEL_PATH,
    preprocessor_path: Path = LOGISTIC_REGRESSION_PREPROCESSOR_PATH,
    metrics_path: Path = LOGISTIC_REGRESSION_METRICS_PATH,
) -> None:
    save_model_artifacts(
        artifacts,
        model_path=model_path,
        preprocessor_path=preprocessor_path,
        metrics_path=metrics_path,
    )


def load_logistic_regression_artifacts(
    *,
    model_path: Path = LOGISTIC_REGRESSION_MODEL_PATH,
    preprocessor_path: Path = LOGISTIC_REGRESSION_PREPROCESSOR_PATH,
) -> tuple[Any, Diabetes130Preprocessor]:
    return load_model_artifacts(model_path=model_path, preprocessor_path=preprocessor_path)


def save_random_forest_artifacts(
    artifacts: TrainingArtifacts,
    *,
    model_path: Path = RANDOM_FOREST_MODEL_PATH,
    preprocessor_path: Path = RANDOM_FOREST_PREPROCESSOR_PATH,
    metrics_path: Path = RANDOM_FOREST_METRICS_PATH,
) -> None:
    save_model_artifacts(
        artifacts,
        model_path=model_path,
        preprocessor_path=preprocessor_path,
        metrics_path=metrics_path,
    )


def load_random_forest_artifacts(
    *,
    model_path: Path = RANDOM_FOREST_MODEL_PATH,
    preprocessor_path: Path = RANDOM_FOREST_PREPROCESSOR_PATH,
) -> tuple[Any, Diabetes130Preprocessor]:
    return load_model_artifacts(model_path=model_path, preprocessor_path=preprocessor_path)


def save_xgboost_artifacts(
    artifacts: TrainingArtifacts,
    *,
    model_path: Path = XGBOOST_MODEL_PATH,
    preprocessor_path: Path = XGBOOST_PREPROCESSOR_PATH,
    metrics_path: Path = XGBOOST_METRICS_PATH,
) -> None:
    save_model_artifacts(
        artifacts,
        model_path=model_path,
        preprocessor_path=preprocessor_path,
        metrics_path=metrics_path,
    )


def load_xgboost_artifacts(
    *,
    model_path: Path = XGBOOST_MODEL_PATH,
    preprocessor_path: Path = XGBOOST_PREPROCESSOR_PATH,
) -> tuple[Any, Diabetes130Preprocessor]:
    return load_model_artifacts(model_path=model_path, preprocessor_path=preprocessor_path)


def load_metrics_from_file(metrics_path: Path) -> dict[str, Any]:
    return json.loads(metrics_path.read_text(encoding="utf-8"))
