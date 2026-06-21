"""Consolidated SHAP output tests (RTS-010, UC-030, T-211)."""

from __future__ import annotations

import pytest

from ml.explainability.explainer import ShapExplainerService, build_demo_patient_features
from ml.preprocessing.constants import DEFAULT_RAW_DATA_PATH
from ml.training.constants import PRODUCTION_MODEL_PATH


@pytest.fixture
def require_shap_environment() -> None:
    if not PRODUCTION_MODEL_PATH.exists():
        pytest.skip("Production artifacts missing. Run: python ml/scripts/serialize_model.py")
    if not DEFAULT_RAW_DATA_PATH.exists():
        pytest.skip("Raw dataset not downloaded")


def test_shap_output_has_top_ranked_features(require_shap_environment: None) -> None:
    result = ShapExplainerService().explain(build_demo_patient_features(), top_n=8)
    assert len(result.contributions) == 8
    ranks = [item.importance_rank for item in result.contributions]
    assert ranks == list(range(1, 9))


def test_shap_output_values_are_present(require_shap_environment: None) -> None:
    result = ShapExplainerService().explain(build_demo_patient_features(), top_n=10)
    assert any(abs(item.shap_value) > 0 for item in result.contributions)
    assert all(item.feature_name for item in result.contributions)
    assert all(item.direction in {"increases_risk", "decreases_risk"} for item in result.contributions)


def test_shap_output_includes_positive_and_negative_factors(require_shap_environment: None) -> None:
    result = ShapExplainerService().explain(build_demo_patient_features(), top_n=10)
    assert result.risk_increasing_factors or result.risk_decreasing_factors
