"""Inference and prediction range tests (RTS-010, T-211)."""

from __future__ import annotations

import pytest

from ml.explainability.explainer import (
    ShapExplainerService,
    build_demo_patient_features,
    classify_risk_level,
)
from ml.training.constants import PRODUCTION_MODEL_PATH
from ml.training.serialize import load_production_manifest, load_production_model


@pytest.fixture
def require_production_artifacts() -> None:
    if not PRODUCTION_MODEL_PATH.exists():
        pytest.skip("Production artifacts missing. Run: python ml/scripts/serialize_model.py")


def test_prediction_range(require_production_artifacts: None) -> None:
    """Risk score must be a valid probability in [0, 1]."""
    model, preprocessor = load_production_model()
    features = build_demo_patient_features()
    transformed = preprocessor.transform(features)
    probabilities = model.predict_proba(transformed)
    score = float(probabilities[0, 1])

    assert 0.0 <= score <= 1.0
    assert sum(probabilities[0]) == pytest.approx(1.0, abs=0.01)


def test_risk_level_aligns_with_score(require_production_artifacts: None) -> None:
    manifest = load_production_manifest()
    threshold = float(manifest["production_threshold"])

    for score, expected in (
        (0.2, "low"),
        (0.4, "medium"),
        (0.8, "high"),
    ):
        assert classify_risk_level(score, threshold=threshold) == expected


def test_end_to_end_predict_and_explain(require_production_artifacts: None) -> None:
    """Full offline inference path used by the future prediction service."""
    features = build_demo_patient_features()
    result = ShapExplainerService().explain(features, top_n=5)

    assert 0.0 <= result.risk_score <= 1.0
    assert result.risk_level in {"low", "medium", "high"}
    assert len(result.contributions) == 5
    assert result.summary
