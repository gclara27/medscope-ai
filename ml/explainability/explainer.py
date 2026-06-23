"""SHAP explainability for production models (T-210, RIA-030, UC-030)."""

from __future__ import annotations

from typing import Any

from pathlib import Path

import numpy as np
import pandas as pd
import shap

from ml.explainability.models import ShapExplanationResult, ShapFeatureContribution
from ml.explainability.summary import build_clinical_summary, display_feature_name
from ml.preprocessing.constants import CATEGORICAL_FEATURES, FEATURE_COLUMNS, RANDOM_STATE
from ml.preprocessing.pipeline import Diabetes130Preprocessor, train_test_split_data
from ml.training.constants import PRODUCTION_SHAP_BACKGROUND_PATH
from ml.training.serialize import load_production_manifest, load_production_model

BACKGROUND_SAMPLE_SIZE = 200
DEFAULT_TOP_FEATURES = 10

RISK_LEVEL_MEDIUM = 0.35


def classify_risk_level(score: float, *, threshold: float) -> str:
    if score >= threshold:
        return "high"
    if score >= RISK_LEVEL_MEDIUM:
        return "medium"
    return "low"


def _parse_transformed_feature_name(transformed_name: str) -> tuple[str, str | None]:
    """Map one-hot encoded column names back to base feature + category value."""
    for base_feature in CATEGORICAL_FEATURES:
        prefix = f"{base_feature}_"
        if transformed_name.startswith(prefix):
            return base_feature, transformed_name[len(prefix) :]
    return transformed_name, None


def _aggregate_shap_to_input_features(
    features: pd.DataFrame,
    transformed_names: list[str],
    shap_values: np.ndarray,
) -> list[tuple[str, object, float]]:
    """Collapse transformed SHAP values onto MVP input features."""
    aggregated: dict[str, float] = {}
    for name, value in zip(transformed_names, shap_values, strict=True):
        base_feature, category = _parse_transformed_feature_name(name)
        if category is not None:
            actual_value = str(features.iloc[0][base_feature])
            if actual_value != category:
                continue
        aggregated[base_feature] = aggregated.get(base_feature, 0.0) + float(value)

    rows: list[tuple[str, object, float]] = []
    for base_feature in FEATURE_COLUMNS:
        if base_feature not in aggregated:
            continue
        rows.append((base_feature, features.iloc[0][base_feature], aggregated[base_feature]))
    return rows


def _rank_contributions(
    aggregated_rows: list[tuple[str, object, float]],
    *,
    top_n: int,
) -> tuple[ShapFeatureContribution, ...]:
    ordered = sorted(aggregated_rows, key=lambda row: abs(row[2]), reverse=True)[:top_n]
    contributions: list[ShapFeatureContribution] = []
    for rank, (base_feature, value, shap_value) in enumerate(ordered, start=1):
        direction = "increases_risk" if shap_value > 0 else "decreases_risk"
        contributions.append(
            ShapFeatureContribution(
                feature_name=display_feature_name(base_feature),
                feature_value=value,
                shap_value=float(shap_value),
                importance_rank=rank,
                direction=direction,
            )
        )
    return tuple(contributions)


def _sample_background_from_dataset(preprocessor: Diabetes130Preprocessor) -> np.ndarray:
    x_train, _, _, _ = train_test_split_data()
    transformed = preprocessor.transform(x_train)
    if len(transformed) > BACKGROUND_SAMPLE_SIZE:
        transformed = transformed.sample(BACKGROUND_SAMPLE_SIZE, random_state=RANDOM_STATE)
    return transformed.to_numpy(dtype=float)


def load_production_shap_background(
    path: Path = PRODUCTION_SHAP_BACKGROUND_PATH,
) -> np.ndarray | None:
    """Load cached SHAP background matrix (no dataset required at inference)."""
    if not path.exists():
        return None
    return np.load(path)


def save_production_shap_background(
    preprocessor: Diabetes130Preprocessor,
    path: Path = PRODUCTION_SHAP_BACKGROUND_PATH,
) -> np.ndarray:
    """Build and persist SHAP background for Docker/production inference."""
    background = _sample_background_from_dataset(preprocessor)
    path.parent.mkdir(parents=True, exist_ok=True)
    np.save(path, background)
    return background


def _sample_background(preprocessor: Diabetes130Preprocessor) -> np.ndarray:
    cached = load_production_shap_background()
    if cached is not None:
        return cached
    return _sample_background_from_dataset(preprocessor)


def _create_shap_explainer(
    model: Any,
    preprocessor: Diabetes130Preprocessor,
    explainer_type: str,
    background: np.ndarray | None = None,
):
    background_matrix = background if background is not None else _sample_background(preprocessor)
    if explainer_type == "linear":
        return shap.LinearExplainer(model, background_matrix)
    if explainer_type == "tree":
        return shap.TreeExplainer(model)
    raise ValueError(f"Unsupported SHAP explainer type: {explainer_type}")


def _extract_positive_class_shap(raw_values: Any) -> np.ndarray:
    if isinstance(raw_values, list):
        return np.asarray(raw_values[1])
    values = np.asarray(raw_values)
    if values.ndim == 3:
        return values[:, :, 1]
    return values


class ShapExplainerService:
    """Compute SHAP explanations using the serialized production model."""

    def __init__(
        self,
        model: Any | None = None,
        preprocessor: Diabetes130Preprocessor | None = None,
        manifest: dict[str, Any] | None = None,
        *,
        background: np.ndarray | None = None,
    ) -> None:
        self.manifest = manifest or load_production_manifest()
        self.model, self.preprocessor = (
            (model, preprocessor)
            if model is not None and preprocessor is not None
            else load_production_model()
        )
        if not self.preprocessor.is_fitted_:
            raise RuntimeError("Preprocessor must be fitted before SHAP explanation.")

        self._explainer = _create_shap_explainer(
            self.model,
            self.preprocessor,
            self.manifest["shap_explainer"],
            background=background,
        )

    def explain(
        self,
        features: pd.DataFrame,
        *,
        top_n: int = DEFAULT_TOP_FEATURES,
    ) -> ShapExplanationResult:
        if len(features) != 1:
            raise ValueError("SHAP explanation currently supports exactly one patient row.")

        transformed = self.preprocessor.transform(features)
        probabilities = self.model.predict_proba(transformed)
        risk_score = float(probabilities[0, 1])
        threshold = float(self.manifest["production_threshold"])
        risk_level = classify_risk_level(risk_score, threshold=threshold)

        raw_shap = self._explainer.shap_values(transformed)
        shap_row = _extract_positive_class_shap(raw_shap)[0]

        aggregated_rows = _aggregate_shap_to_input_features(
            features,
            self.preprocessor.get_feature_names_out(),
            shap_row,
        )
        contributions = _rank_contributions(aggregated_rows, top_n=top_n)
        summary = build_clinical_summary(contributions)

        return ShapExplanationResult(
            risk_score=risk_score,
            risk_level=risk_level,
            model_id=self.manifest["model_id"],
            model_version=self.manifest["model_version"],
            production_threshold=threshold,
            contributions=contributions,
            summary=summary,
        )

    def predict_risk(self, features: pd.DataFrame) -> tuple[float, str]:
        """Fast inference without SHAP (UC-042, simulation)."""
        if len(features) != 1:
            raise ValueError("Risk prediction currently supports exactly one patient row.")

        transformed = self.preprocessor.transform(features)
        probabilities = self.model.predict_proba(transformed)
        risk_score = float(probabilities[0, 1])
        threshold = float(self.manifest["production_threshold"])
        return risk_score, classify_risk_level(risk_score, threshold=threshold)


def explain_patient(features: pd.DataFrame, *, top_n: int = DEFAULT_TOP_FEATURES) -> ShapExplanationResult:
    """Convenience wrapper for one-off SHAP explanations."""
    return ShapExplainerService().explain(features, top_n=top_n)


def build_demo_patient_features() -> pd.DataFrame:
    """Return a single demo patient row for scripts and smoke tests."""
    row: dict[str, object] = {
        "age_midpoint": 65.0,
        "time_in_hospital": 3,
        "num_medications": 8,
        "number_inpatient": 1,
        "number_outpatient": 0,
        "number_emergency": 0,
        "total_prior_visits": 1,
        "num_lab_procedures": 25,
        "num_procedures": 1,
        "number_diagnoses": 4,
        "active_diabetes_meds_count": 2,
        "has_insulin": 0,
        "meds_per_day": 2.67,
        "gender": "Female",
        "race": "Caucasian",
        "max_glu_serum": "Norm",
        "A1Cresult": "None",
        "change": "No",
        "diabetesMed": "Yes",
    }
    return pd.DataFrame([row], columns=list(FEATURE_COLUMNS))
