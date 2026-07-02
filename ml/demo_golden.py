"""Pinned demo predictions for T-902 — deterministic scores for defense scenarios."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

from ml.training.constants import MODELS_DIR

DEMO_GOLDEN_PATH = MODELS_DIR / "demo_golden_predictions.json"

RISK_THRESHOLD_HIGH = 0.5
RISK_THRESHOLD_MEDIUM = 0.35

# Clinical payloads aligned with frontend clinicalDemoScenarios.ts (T-907).
_DEMO_COMMON_FIELDS = {
    "num_lab_procedures": 25,
    "num_procedures": 1,
    "number_diagnoses": 4,
    "active_diabetes_meds_count": 2,
    "has_insulin": False,
    "race": "Caucasian",
    "a1c_result": "None",
    "medication_change": "No",
    "diabetes_medication": "Yes",
}

DEMO_SCENARIO_PAYLOADS: dict[str, dict[str, Any]] = {
    "high-readmission": {
        "age": 72,
        "gender": "Female",
        "hospital_stay_days": 6,
        "medications_count": 12,
        "previous_admissions": 5,
        "glucose": 198,
        "blood_pressure": 142,
        "bmi": 31.2,
        "number_outpatient": 0,
        "number_emergency": 0,
        **_DEMO_COMMON_FIELDS,
    },
    "moderate-risk": {
        "age": 58,
        "gender": "Male",
        "hospital_stay_days": 4,
        "medications_count": 6,
        "previous_admissions": 1,
        "glucose": 165,
        "blood_pressure": 128,
        "bmi": 29.0,
        "number_outpatient": 0,
        "number_emergency": 0,
        **_DEMO_COMMON_FIELDS,
    },
    "low-risk-stable": {
        "age": 42,
        "gender": "Female",
        "hospital_stay_days": 2,
        "medications_count": 3,
        "previous_admissions": 0,
        "glucose": 108,
        "blood_pressure": 118,
        "bmi": 24.5,
        "number_outpatient": 0,
        "number_emergency": 0,
        **_DEMO_COMMON_FIELDS,
    },
}

SIMULATION_SHOWCASE_MODIFICATIONS = {
    "previous_admissions": 2,
    "glucose": 140,
}


def load_demo_golden(path: Path = DEMO_GOLDEN_PATH) -> dict[str, Any]:
    if not path.exists():
        raise FileNotFoundError(
            f"Demo golden predictions not found at {path}. Regenerate after model serialize.",
        )
    return json.loads(path.read_text(encoding="utf-8"))


def assert_manifest_matches_golden(manifest: dict[str, Any], golden: dict[str, Any]) -> None:
    for key in ("model_id", "model_version"):
        if manifest.get(key) != golden.get(key):
            raise AssertionError(
                f"Manifest {key}={manifest.get(key)!r} does not match golden {golden.get(key)!r}",
            )


def score_within_tolerance(actual: float, expected: float, tolerance: float) -> bool:
    return abs(actual - expected) <= tolerance


def export_demo_golden_predictions() -> dict[str, Any]:
    """Compute pinned scores from production artifacts (run after serialize)."""
    backend_root = Path(__file__).resolve().parents[1] / "backend"
    if str(backend_root) not in sys.path:
        sys.path.insert(0, str(backend_root))

    from schemas.prediction import PredictRequest
    from schemas.simulation import SimulateModifications
    from services.prediction_mapper import request_to_feature_frame
    from services.risk_classification import classify_risk_level
    from services.simulation_mapper import apply_simulation_modifications

    from ml.training.serialize import load_production_manifest, load_production_model

    manifest = load_production_manifest()
    model, preprocessor = load_production_model()

    def score_request(request: PredictRequest) -> tuple[float, float, str]:
        features = request_to_feature_frame(request)
        transformed = preprocessor.transform(features)
        risk_score = float(model.predict_proba(transformed)[0, 1])
        risk_percent = round(risk_score * 100, 2)
        risk_level = classify_risk_level(
            risk_score,
            high_threshold=RISK_THRESHOLD_HIGH,
            medium_threshold=RISK_THRESHOLD_MEDIUM,
        )
        return risk_score, risk_percent, risk_level

    scenarios: dict[str, Any] = {}
    for scenario_id, payload in DEMO_SCENARIO_PAYLOADS.items():
        risk_score, risk_percent, risk_level = score_request(PredictRequest(**payload))
        scenarios[scenario_id] = {
            "payload": payload,
            "expected": {
                "risk_score": round(risk_score, 6),
                "risk_percent": risk_percent,
                "risk_level": risk_level,
            },
        }

    baseline_id = "high-readmission"
    baseline = PredictRequest(**DEMO_SCENARIO_PAYLOADS[baseline_id])
    simulated = apply_simulation_modifications(
        baseline,
        SimulateModifications(**SIMULATION_SHOWCASE_MODIFICATIONS),
    )
    original_score, original_percent, original_level = score_request(baseline)
    simulated_score, simulated_percent, simulated_level = score_request(simulated)
    delta_percent = round(simulated_percent - original_percent, 2)

    return {
        "schema_version": "1.0.0",
        "model_id": manifest["model_id"],
        "model_version": manifest["model_version"],
        "risk_threshold_high": RISK_THRESHOLD_HIGH,
        "risk_threshold_medium": RISK_THRESHOLD_MEDIUM,
        "score_tolerance": 0.0001,
        "percent_tolerance": 0.01,
        "scenarios": scenarios,
        "simulation": {
            "baseline_scenario": baseline_id,
            "modifications": SIMULATION_SHOWCASE_MODIFICATIONS,
            "expected": {
                "original_risk_percent": original_percent,
                "simulated_risk_percent": simulated_percent,
                "delta_risk_percent": delta_percent,
                "original_risk_level": original_level,
                "simulated_risk_level": simulated_level,
            },
        },
    }


def write_demo_golden_predictions(path: Path = DEMO_GOLDEN_PATH) -> dict[str, Any]:
    golden = export_demo_golden_predictions()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(golden, indent=2) + "\n", encoding="utf-8")
    return golden
