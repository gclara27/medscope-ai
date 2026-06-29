"""MLComparisonService tests — T-X07-01, RIA-040."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from core.paths import MODELS_DIR
from services.ml_comparison_service import MLComparisonService, OFFLINE_COMPARISON_NOTE

SAMPLE_MANIFEST = {
    "model_id": "logistic_regression",
    "model_version": "1.0.0",
    "production_threshold": 0.5,
}

SAMPLE_BASELINE = {
    "primary_metric": "recall",
    "winner": "logistic_regression",
    "summary": "Logistic Regression wins on recall.",
    "logistic_regression": {
        "accuracy": 0.61,
        "recall": 0.54,
        "precision": 0.12,
        "f1": 0.20,
        "roc_auc": 0.61,
    },
    "random_forest": {
        "accuracy": 0.82,
        "recall": 0.20,
        "precision": 0.14,
        "f1": 0.17,
        "roc_auc": 0.59,
    },
}

def _write_models_dir(
    tmp_path: Path,
    *,
    manifest: dict | None = SAMPLE_MANIFEST,
    baseline: dict | None = SAMPLE_BASELINE,
    xgboost: dict | None = None,
) -> Path:
    if manifest is not None:
        (tmp_path / "model_manifest.json").write_text(json.dumps(manifest), encoding="utf-8")
    if baseline is not None:
        (tmp_path / "baseline_comparison.json").write_text(json.dumps(baseline), encoding="utf-8")
    if xgboost is not None:
        (tmp_path / "xgboost_evaluation.json").write_text(json.dumps(xgboost), encoding="utf-8")
    return tmp_path


def test_returns_unavailable_when_required_artifacts_missing(tmp_path: Path) -> None:
    result = MLComparisonService(tmp_path).get_comparison()

    assert result.is_available is False
    assert "model_manifest.json" in result.missing_artifacts
    assert "baseline_comparison.json" in result.missing_artifacts
    assert result.offline_note == OFFLINE_COMPARISON_NOTE


def test_loads_baseline_comparison_with_production_manifest(tmp_path: Path) -> None:
    models_dir = _write_models_dir(tmp_path, xgboost=None)
    result = MLComparisonService(models_dir).get_comparison()

    assert result.is_available is True
    assert result.production_model_id == "logistic_regression"
    assert result.recall_winner == "logistic_regression"
    assert result.baseline_winner == "logistic_regression"

    logistic = next(item for item in result.models if item.model_id == "logistic_regression")
    random_forest = next(item for item in result.models if item.model_id == "random_forest")
    xgboost = next(item for item in result.models if item.model_id == "xgboost")

    assert logistic.is_production is True
    assert logistic.metrics is not None
    assert logistic.metrics.recall == pytest.approx(0.54)
    assert random_forest.available is True
    assert xgboost.available is False


def test_prefers_xgboost_evaluation_when_present(tmp_path: Path) -> None:
    xgboost_payload = {
        "primary_metric": "recall",
        "recall_winner": "logistic_regression",
        "production_model": "logistic_regression",
        "summary": "Extended comparison summary.",
        "rationale": ["Includes XGBoost candidate."],
        "models": {
            "logistic_regression": SAMPLE_BASELINE["logistic_regression"],
            "random_forest": SAMPLE_BASELINE["random_forest"],
            "xgboost": {
                "accuracy": 0.67,
                "recall": 0.44,
                "precision": 0.12,
                "f1": 0.19,
                "roc_auc": 0.60,
            },
        },
    }
    models_dir = _write_models_dir(tmp_path, xgboost=xgboost_payload)
    result = MLComparisonService(models_dir).get_comparison()

    assert result.summary == "Extended comparison summary."
    assert result.rationale == ("Includes XGBoost candidate.",)
    xgboost = next(item for item in result.models if item.model_id == "xgboost")
    assert xgboost.available is True
    assert xgboost.metrics is not None
    assert xgboost.metrics.recall == pytest.approx(0.44)


@pytest.mark.skipif(
    not (MODELS_DIR / "baseline_comparison.json").exists(),
    reason="Repo ML artifacts missing",
)
def test_loads_repo_training_artifacts() -> None:
    result = MLComparisonService().get_comparison()

    assert result.is_available is True
    assert result.production_model_id == "logistic_regression"
    assert result.recall_winner == "logistic_regression"
    available_models = [item.model_id for item in result.models if item.available]
    assert "logistic_regression" in available_models
    assert "random_forest" in available_models
