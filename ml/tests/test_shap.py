"""SHAP explainability tests (T-210, RIA-030, UC-030)."""

from __future__ import annotations

import numpy as np
import pandas as pd
import pytest

from ml.explainability.explainer import (
    ShapExplainerService,
    _aggregate_shap_to_input_features,
    _parse_transformed_feature_name,
    build_demo_patient_features,
    classify_risk_level,
)
from ml.explainability.summary import build_clinical_summary, display_feature_name
from ml.preprocessing.constants import DEFAULT_RAW_DATA_PATH
from ml.training.constants import MODEL_MANIFEST_PATH, PRODUCTION_MODEL_PATH


def test_parse_transformed_feature_name_for_one_hot() -> None:
    base, category = _parse_transformed_feature_name("gender_Female")
    assert base == "gender"
    assert category == "Female"


def test_parse_transformed_feature_name_for_numeric() -> None:
    base, category = _parse_transformed_feature_name("age_midpoint")
    assert base == "age_midpoint"
    assert category is None


def test_aggregate_shap_to_input_features_groups_one_hot() -> None:
    features = pd.DataFrame([{"gender": "Female", "age_midpoint": 65.0}], columns=["gender", "age_midpoint"])
    rows = _aggregate_shap_to_input_features(
        features,
        ["age_midpoint", "gender_Female", "gender_Male"],
        np.array([0.2, 0.3, -0.1]),
    )
    by_name = {name: shap_value for name, _, shap_value in rows}
    assert by_name["age_midpoint"] == pytest.approx(0.2)
    assert by_name["gender"] == pytest.approx(0.3)


def test_classify_risk_level_uses_manifest_threshold() -> None:
    assert classify_risk_level(0.6, threshold=0.5) == "high"
    assert classify_risk_level(0.4, threshold=0.5) == "medium"
    assert classify_risk_level(0.2, threshold=0.5) == "low"


def test_build_clinical_summary_uses_neutral_language() -> None:
    from ml.explainability.models import ShapFeatureContribution

    summary = build_clinical_summary(
        (
            ShapFeatureContribution("Prior inpatient visits", 2, 0.2, 1, "increases_risk"),
            ShapFeatureContribution("Age", 65, -0.1, 2, "decreases_risk"),
        )
    )
    assert "Main risk drivers" in summary
    assert "not a diagnosis" in summary


def test_display_feature_name_is_human_readable() -> None:
    assert display_feature_name("number_inpatient") == "Prior inpatient visits"


def test_shap_explainer_service_returns_ranked_contributions() -> None:
    if not PRODUCTION_MODEL_PATH.exists() or not MODEL_MANIFEST_PATH.exists():
        pytest.skip("Production model artifacts not available")
    if not DEFAULT_RAW_DATA_PATH.exists():
        pytest.skip("Raw dataset not downloaded")

    features = build_demo_patient_features()
    result = ShapExplainerService().explain(features, top_n=5)

    assert 0.0 <= result.risk_score <= 1.0
    assert result.risk_level in {"low", "medium", "high"}
    assert len(result.contributions) == 5
    assert result.contributions[0].importance_rank == 1
    assert all(item.feature_name for item in result.contributions)
    assert result.summary
    assert result.model_id == "logistic_regression"


def test_shap_values_are_non_zero_for_demo_patient() -> None:
    if not PRODUCTION_MODEL_PATH.exists():
        pytest.skip("Production model artifacts not available")
    if not DEFAULT_RAW_DATA_PATH.exists():
        pytest.skip("Raw dataset not downloaded")

    result = ShapExplainerService().explain(build_demo_patient_features(), top_n=10)
    assert any(abs(item.shap_value) > 0 for item in result.contributions)


def test_shap_explanation_is_deterministic_for_same_input() -> None:
    if not PRODUCTION_MODEL_PATH.exists():
        pytest.skip("Production model artifacts not available")
    if not DEFAULT_RAW_DATA_PATH.exists():
        pytest.skip("Raw dataset not downloaded")

    features = build_demo_patient_features()
    service = ShapExplainerService()
    first = service.explain(features)
    second = service.explain(features)
    assert first.risk_score == second.risk_score
    assert first.contributions[0].shap_value == second.contributions[0].shap_value
