"""Production serialization tests (T-209, RIA-020)."""

from __future__ import annotations

import json
from pathlib import Path

import joblib
import pytest

from ml.preprocessing.constants import FEATURE_COLUMNS
from ml.preprocessing.pipeline import Diabetes130Preprocessor
from ml.training.constants import (
    FINAL_MODEL_DIR,
    LOGISTIC_REGRESSION_MODEL_PATH,
    MODEL_FILENAME,
    PREPROCESSOR_FILENAME,
)
from ml.training.serialize import (
    build_production_manifest,
    load_production_manifest,
    load_production_model,
    serialize_production_model,
    validate_production_artifacts,
)


@pytest.fixture
def prepared_final_dir(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    if not LOGISTIC_REGRESSION_MODEL_PATH.exists():
        pytest.skip("Trained logistic regression artifacts not available")

    final_dir = tmp_path / "final"
    final_dir.mkdir()
    selection_path = tmp_path / "final_model_selection.json"
    model_path = tmp_path / "model.pkl"
    preprocessor_path = tmp_path / "preprocessor.pkl"
    manifest_path = tmp_path / "model_manifest.json"
    shap_background_path = tmp_path / "shap_background.npy"

    selection = {
        "model_id": "logistic_regression",
        "model_version": "1.0.0",
        "production_threshold": 0.5,
        "shap_explainer": "linear",
    }
    selection_path.write_text(json.dumps(selection), encoding="utf-8")

    joblib.dump(joblib.load(LOGISTIC_REGRESSION_MODEL_PATH), final_dir / MODEL_FILENAME)
    joblib.dump(
        joblib.load(LOGISTIC_REGRESSION_MODEL_PATH.parent / PREPROCESSOR_FILENAME),
        final_dir / PREPROCESSOR_FILENAME,
    )

    monkeypatch.setattr("ml.training.serialize.FINAL_MODEL_DIR", final_dir)
    monkeypatch.setattr("ml.training.serialize.FINAL_MODEL_SELECTION_PATH", selection_path)
    monkeypatch.setattr("ml.training.serialize.PRODUCTION_MODEL_PATH", model_path)
    monkeypatch.setattr("ml.training.serialize.PRODUCTION_PREPROCESSOR_PATH", preprocessor_path)
    monkeypatch.setattr("ml.training.serialize.MODEL_MANIFEST_PATH", manifest_path)
    monkeypatch.setattr("ml.training.serialize.PRODUCTION_SHAP_BACKGROUND_PATH", shap_background_path)
    return final_dir


def test_build_production_manifest_includes_feature_columns() -> None:
    manifest = build_production_manifest(
        {
            "model_id": "logistic_regression",
            "model_version": "1.0.0",
            "production_threshold": 0.5,
            "shap_explainer": "linear",
        }
    )
    assert manifest.feature_columns == FEATURE_COLUMNS
    assert manifest.model_path == "model.pkl"


def test_serialize_production_model_writes_artifacts(prepared_final_dir: Path, tmp_path: Path) -> None:
    model_path = tmp_path / "model.pkl"
    preprocessor_path = tmp_path / "preprocessor.pkl"
    manifest_path = tmp_path / "model_manifest.json"

    manifest = serialize_production_model(
        model_path=model_path,
        preprocessor_path=preprocessor_path,
        manifest_path=manifest_path,
    )

    assert model_path.exists()
    assert preprocessor_path.exists()
    assert manifest_path.exists()
    assert manifest.model_id == "logistic_regression"
    shap_background_path = tmp_path / "shap_background.npy"
    assert shap_background_path.exists()


def test_load_production_model_and_manifest(prepared_final_dir: Path, tmp_path: Path) -> None:
    model_path = tmp_path / "model.pkl"
    preprocessor_path = tmp_path / "preprocessor.pkl"
    manifest_path = tmp_path / "model_manifest.json"

    serialize_production_model(
        model_path=model_path,
        preprocessor_path=preprocessor_path,
        manifest_path=manifest_path,
    )

    model, preprocessor = load_production_model(
        model_path=model_path,
        preprocessor_path=preprocessor_path,
    )
    manifest = load_production_manifest(manifest_path)

    assert hasattr(model, "predict_proba")
    assert isinstance(preprocessor, Diabetes130Preprocessor)
    assert manifest["model_id"] == "logistic_regression"


def test_validate_production_artifacts_runs_smoke_prediction(
    prepared_final_dir: Path,
    tmp_path: Path,
) -> None:
    model_path = tmp_path / "model.pkl"
    preprocessor_path = tmp_path / "preprocessor.pkl"
    manifest_path = tmp_path / "model_manifest.json"

    serialize_production_model(
        model_path=model_path,
        preprocessor_path=preprocessor_path,
        manifest_path=manifest_path,
    )
    validate_production_artifacts(
        model_path=model_path,
        preprocessor_path=preprocessor_path,
        manifest_path=manifest_path,
    )


def test_serialize_production_model_integration() -> None:
    if not (FINAL_MODEL_DIR / MODEL_FILENAME).exists():
        pytest.skip("Final model artifacts not available")

    manifest = serialize_production_model()
    validate_production_artifacts()
    assert manifest.model_id == "logistic_regression"
