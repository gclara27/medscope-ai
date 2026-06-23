"""Final model selection for production inference (T-208, EP-2.8)."""

from __future__ import annotations

import json
import shutil
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from ml.evaluation.compare import select_baseline_winner
from ml.evaluation.constants import DEFAULT_THRESHOLD, TARGET_ACCURACY
from ml.evaluation.metrics import ClassificationMetrics
from ml.evaluation.report import EvaluationReport
from ml.training.constants import (
    FINAL_MODEL_DIR,
    FINAL_MODEL_SELECTION_PATH,
    LOGISTIC_REGRESSION_MODEL_ID,
    MODEL_FILENAME,
    MODEL_SOURCE_DIRS,
    MODEL_VERSIONS,
    PREPROCESSOR_FILENAME,
    RANDOM_FOREST_MODEL_ID,
    SHAP_EXPLAINER_BY_MODEL,
)

PRODUCTION_SELECTION_POLICY = "production_default_threshold"


@dataclass(frozen=True)
class FinalModelSelection:
    model_id: str
    model_version: str
    production_threshold: float
    selection_policy: str
    metrics: ClassificationMetrics
    meets_accuracy_target: bool
    rejected_models: dict[str, str]
    rationale: tuple[str, ...]
    shap_explainer: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "model_id": self.model_id,
            "model_version": self.model_version,
            "production_threshold": self.production_threshold,
            "selection_policy": self.selection_policy,
            "metrics": self.metrics.to_dict(),
            "meets_accuracy_target": self.meets_accuracy_target,
            "rejected_models": self.rejected_models,
            "rationale": list(self.rationale),
            "shap_explainer": self.shap_explainer,
            "artifact_directory": str(FINAL_MODEL_DIR),
        }


def _rejection_reason(
    rejected_id: str,
    rejected_metrics: ClassificationMetrics,
    winner_id: str,
    winner_metrics: ClassificationMetrics,
) -> str:
    if rejected_id == RANDOM_FOREST_MODEL_ID:
        return (
            "Random Forest has higher accuracy at threshold 0.5 but lower recall "
            f"({rejected_metrics.recall:.4f} vs {winner_metrics.recall:.4f}). "
            "Healthcare priority favors catching readmissions (EP-2.7)."
        )
    return f"Lower recall at production threshold ({rejected_metrics.recall:.4f} vs {winner_metrics.recall:.4f})."


def select_final_model(report: EvaluationReport) -> FinalModelSelection:
    """Select the production model using realistic default-threshold metrics."""
    logistic = report.models[LOGISTIC_REGRESSION_MODEL_ID].default_threshold
    random_forest = report.models[RANDOM_FOREST_MODEL_ID].default_threshold

    winner_id = select_baseline_winner(
        logistic.metrics,
        random_forest.metrics,
        primary_metric="recall",
    )
    winner_block = report.models[winner_id].default_threshold
    loser_id = RANDOM_FOREST_MODEL_ID if winner_id == LOGISTIC_REGRESSION_MODEL_ID else LOGISTIC_REGRESSION_MODEL_ID
    loser_block = report.models[loser_id].default_threshold

    rejected = {
        loser_id: _rejection_reason(
            loser_id,
            loser_block.metrics,
            winner_id,
            winner_block.metrics,
        )
    }

    rationale = (
        (
            "Selection uses the production decision threshold 0.5; recall-optimized thresholds "
            "were not adopted because they collapse accuracy below clinical usability."
        ),
        (
            f"Primary metric is recall (Requirements EP-2.7, RIA-012). {winner_id} achieves "
            "the best recall on the held-out test split at threshold 0.5."
        ),
        (
            f"Accuracy target (>={TARGET_ACCURACY:.0%}) is "
            f"{'met' if winner_block.meets_accuracy_target else 'not met'} by the selected model; "
            "recall remains the deciding factor for this MVP baseline."
        ),
        (
            f"{RANDOM_FOREST_MODEL_ID} remains a strong accuracy baseline "
            f"(accuracy={random_forest.metrics.accuracy:.4f}) but misses too many positive readmissions "
            f"(recall={random_forest.metrics.recall:.4f}) for a CDSS focused on risk detection."
        ),
    )

    return FinalModelSelection(
        model_id=winner_id,
        model_version=MODEL_VERSIONS[winner_id],
        production_threshold=DEFAULT_THRESHOLD,
        selection_policy=PRODUCTION_SELECTION_POLICY,
        metrics=winner_block.metrics,
        meets_accuracy_target=winner_block.meets_accuracy_target,
        rejected_models=rejected,
        rationale=rationale,
        shap_explainer=SHAP_EXPLAINER_BY_MODEL[winner_id],
    )


def promote_final_model_artifacts(selection: FinalModelSelection) -> None:
    """Copy selected model artifacts into models/final/ for downstream serialization."""
    source_dir = MODEL_SOURCE_DIRS[selection.model_id]
    model_source = source_dir / MODEL_FILENAME
    preprocessor_source = source_dir / PREPROCESSOR_FILENAME

    if not model_source.exists() or not preprocessor_source.exists():
        raise FileNotFoundError(
            f"Missing trained artifacts for {selection.model_id} in {source_dir}. Run the training scripts first."
        )

    FINAL_MODEL_DIR.mkdir(parents=True, exist_ok=True)
    shutil.copy2(model_source, FINAL_MODEL_DIR / MODEL_FILENAME)
    shutil.copy2(preprocessor_source, FINAL_MODEL_DIR / PREPROCESSOR_FILENAME)


def save_final_model_selection(
    selection: FinalModelSelection,
    path: Path | None = None,
) -> None:
    output_path = path if path is not None else FINAL_MODEL_SELECTION_PATH
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(selection.to_dict(), indent=2), encoding="utf-8")


def run_final_model_selection(
    report: EvaluationReport,
    *,
    promote_artifacts: bool = True,
) -> FinalModelSelection:
    selection = select_final_model(report)
    if promote_artifacts:
        promote_final_model_artifacts(selection)
    save_final_model_selection(selection)
    return selection
