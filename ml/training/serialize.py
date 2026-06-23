"""Serialize production model artifacts for backend inference (T-209, RIA-020)."""

from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import joblib
import pandas as pd

from ml.preprocessing.constants import FEATURE_COLUMNS
from ml.preprocessing.pipeline import Diabetes130Preprocessor
from ml.training.constants import (
    FINAL_MODEL_DIR,
    FINAL_MODEL_SELECTION_PATH,
    MODEL_FILENAME,
    MODEL_MANIFEST_PATH,
    PREPROCESSOR_FILENAME,
    PRODUCTION_MODEL_PATH,
    PRODUCTION_PREPROCESSOR_PATH,
    PRODUCTION_SHAP_BACKGROUND_PATH,
)


@dataclass(frozen=True)
class ProductionModelManifest:
    model_id: str
    model_version: str
    production_threshold: float
    feature_columns: tuple[str, ...]
    shap_explainer: str
    model_path: str
    preprocessor_path: str
    source_directory: str
    serialized_at: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "model_id": self.model_id,
            "model_version": self.model_version,
            "production_threshold": self.production_threshold,
            "feature_columns": list(self.feature_columns),
            "shap_explainer": self.shap_explainer,
            "model_path": self.model_path,
            "preprocessor_path": self.preprocessor_path,
            "source_directory": self.source_directory,
            "serialized_at": self.serialized_at,
        }


def load_final_model_selection(path: Path = FINAL_MODEL_SELECTION_PATH) -> dict[str, Any]:
    if not path.exists():
        raise FileNotFoundError(
            f"Final model selection not found at {path}. Run: python ml/scripts/select_final_model.py"
        )
    return json.loads(path.read_text(encoding="utf-8"))


def build_production_manifest(selection: dict[str, Any]) -> ProductionModelManifest:
    return ProductionModelManifest(
        model_id=selection["model_id"],
        model_version=selection["model_version"],
        production_threshold=float(selection["production_threshold"]),
        feature_columns=FEATURE_COLUMNS,
        shap_explainer=selection["shap_explainer"],
        model_path=MODEL_FILENAME,
        preprocessor_path=PREPROCESSOR_FILENAME,
        source_directory=str(FINAL_MODEL_DIR),
        serialized_at=datetime.now(UTC).isoformat(),
    )


def serialize_production_model(
    *,
    source_dir: Path = FINAL_MODEL_DIR,
    model_path: Path = PRODUCTION_MODEL_PATH,
    preprocessor_path: Path = PRODUCTION_PREPROCESSOR_PATH,
    manifest_path: Path = MODEL_MANIFEST_PATH,
    selection_path: Path = FINAL_MODEL_SELECTION_PATH,
) -> ProductionModelManifest:
    """Copy final model artifacts to models/model.pkl and models/preprocessor.pkl."""
    selection = load_final_model_selection(selection_path)
    manifest = build_production_manifest(selection)

    source_model = source_dir / MODEL_FILENAME
    source_preprocessor = source_dir / PREPROCESSOR_FILENAME
    if not source_model.exists() or not source_preprocessor.exists():
        raise FileNotFoundError(f"Missing artifacts in {source_dir}. Run: python ml/scripts/select_final_model.py")

    model_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(joblib.load(source_model), model_path)
    preprocessor = joblib.load(source_preprocessor)
    joblib.dump(preprocessor, preprocessor_path)

    from ml.explainability.explainer import save_production_shap_background

    save_production_shap_background(preprocessor, PRODUCTION_SHAP_BACKGROUND_PATH)

    manifest_path.write_text(json.dumps(manifest.to_dict(), indent=2), encoding="utf-8")
    return manifest


def load_production_model(
    *,
    model_path: Path = PRODUCTION_MODEL_PATH,
    preprocessor_path: Path = PRODUCTION_PREPROCESSOR_PATH,
) -> tuple[Any, Diabetes130Preprocessor]:
    if not model_path.exists() or not preprocessor_path.exists():
        raise FileNotFoundError("Production artifacts not found. Run: python ml/scripts/serialize_model.py")
    model = joblib.load(model_path)
    preprocessor = joblib.load(preprocessor_path)
    return model, preprocessor


def load_production_manifest(path: Path = MODEL_MANIFEST_PATH) -> dict[str, Any]:
    if not path.exists():
        raise FileNotFoundError(f"Model manifest not found at {path}. Run: python ml/scripts/serialize_model.py")
    return json.loads(path.read_text(encoding="utf-8"))


def _build_smoke_sample_row() -> pd.DataFrame:
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
    missing = [column for column in FEATURE_COLUMNS if column not in row]
    if missing:
        raise ValueError(f"Smoke sample missing feature columns: {missing}")
    return pd.DataFrame([row], columns=list(FEATURE_COLUMNS))


def validate_production_artifacts(
    *,
    model_path: Path = PRODUCTION_MODEL_PATH,
    preprocessor_path: Path = PRODUCTION_PREPROCESSOR_PATH,
    manifest_path: Path = MODEL_MANIFEST_PATH,
) -> None:
    """Smoke-check that serialized artifacts load and can score one row."""
    model, preprocessor = load_production_model(
        model_path=model_path,
        preprocessor_path=preprocessor_path,
    )
    manifest = load_production_manifest(manifest_path)

    if not isinstance(preprocessor, Diabetes130Preprocessor):
        raise TypeError("Production preprocessor has unexpected type.")
    if not preprocessor.is_fitted_:
        raise RuntimeError("Production preprocessor is not fitted.")

    sample = _build_smoke_sample_row()

    transformed = preprocessor.transform(sample)
    probabilities = model.predict_proba(transformed)
    if probabilities.shape != (1, 2):
        raise ValueError("Production model returned unexpected predict_proba shape.")

    expected_features = tuple(manifest["feature_columns"])
    if expected_features != FEATURE_COLUMNS:
        raise ValueError("Manifest feature columns do not match preprocessing constants.")
