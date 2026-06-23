"""Production model load tests (RTS-010, UC-082, T-211)."""

from __future__ import annotations

import joblib
import pytest

from ml.preprocessing.constants import FEATURE_COLUMNS
from ml.preprocessing.pipeline import Diabetes130Preprocessor
from ml.training.constants import (
    MODEL_MANIFEST_PATH,
    PRODUCTION_MODEL_PATH,
    PRODUCTION_PREPROCESSOR_PATH,
)
from ml.training.serialize import load_production_manifest, load_production_model


@pytest.fixture
def require_production_artifacts() -> None:
    if not PRODUCTION_MODEL_PATH.exists() or not PRODUCTION_PREPROCESSOR_PATH.exists():
        pytest.skip("Production artifacts missing. Run: python ml/scripts/serialize_model.py")
    if not MODEL_MANIFEST_PATH.exists():
        pytest.skip("Model manifest missing. Run: python ml/scripts/serialize_model.py")


def test_model_load(require_production_artifacts: None) -> None:
    """UC-082: production model and preprocessor load from disk."""
    model, preprocessor = load_production_model()
    assert hasattr(model, "predict_proba")
    assert isinstance(preprocessor, Diabetes130Preprocessor)
    assert preprocessor.is_fitted_


def test_model_load_joblib_round_trip(require_production_artifacts: None) -> None:
    model = joblib.load(PRODUCTION_MODEL_PATH)
    preprocessor = joblib.load(PRODUCTION_PREPROCESSOR_PATH)
    assert model is not None
    assert preprocessor is not None


def test_manifest_matches_preprocessor_features(require_production_artifacts: None) -> None:
    manifest = load_production_manifest()
    _, preprocessor = load_production_model()
    assert tuple(manifest["feature_columns"]) == FEATURE_COLUMNS
    assert preprocessor.feature_columns_ == FEATURE_COLUMNS
    assert len(preprocessor.get_feature_names_out()) > len(FEATURE_COLUMNS)
