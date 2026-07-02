"""Pinned demo scenario scores — T-902, no score drift across deploys."""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[2]
BACKEND_ROOT = REPO_ROOT / "backend"
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from ml.demo_golden import (
    assert_manifest_matches_golden,
    load_demo_golden,
    score_within_tolerance,
)
from ml.training.constants import PRODUCTION_MODEL_PATH
from ml.training.serialize import load_production_manifest, load_production_model


@pytest.fixture
def require_production_artifacts() -> None:
    if not PRODUCTION_MODEL_PATH.exists():
        pytest.skip("Production artifacts missing. Run: python ml/scripts/serialize_model.py")


def test_demo_golden_matches_production_manifest(require_production_artifacts: None) -> None:
    golden = load_demo_golden()
    manifest = load_production_manifest()
    assert_manifest_matches_golden(manifest, golden)


@pytest.mark.parametrize("scenario_id", ["high-readmission", "moderate-risk", "low-risk-stable"])
def test_demo_scenario_scores_match_golden(
    require_production_artifacts: None,
    scenario_id: str,
) -> None:
    from backend.services.prediction_mapper import request_to_feature_frame
    from backend.services.risk_classification import classify_risk_level
    from schemas.prediction import PredictRequest

    golden = load_demo_golden()
    scenario = golden["scenarios"][scenario_id]
    payload = scenario["payload"]
    expected = scenario["expected"]

    model, preprocessor = load_production_model()
    request = PredictRequest(**payload)
    features = request_to_feature_frame(request)
    transformed = preprocessor.transform(features)
    score = float(model.predict_proba(transformed)[0, 1])

    assert score_within_tolerance(score, expected["risk_score"], golden["score_tolerance"])
    assert score_within_tolerance(
        round(score * 100, 2),
        expected["risk_percent"],
        golden["percent_tolerance"],
    )

    level = classify_risk_level(
        score,
        high_threshold=golden["risk_threshold_high"],
        medium_threshold=golden["risk_threshold_medium"],
    )
    assert level == expected["risk_level"]


def test_simulation_showcase_delta_matches_golden(require_production_artifacts: None) -> None:
    from backend.services.prediction_mapper import request_to_feature_frame
    from backend.services.risk_classification import classify_risk_level
    from backend.services.simulation_mapper import apply_simulation_modifications
    from schemas.prediction import PredictRequest
    from schemas.simulation import SimulateModifications

    golden = load_demo_golden()
    sim = golden["simulation"]
    baseline_payload = golden["scenarios"][sim["baseline_scenario"]]["payload"]
    baseline = PredictRequest(**baseline_payload)
    simulated = apply_simulation_modifications(
        baseline,
        SimulateModifications(**sim["modifications"]),
    )

    model, preprocessor = load_production_model()

    def predict_score(request: PredictRequest) -> float:
        features = request_to_feature_frame(request)
        transformed = preprocessor.transform(features)
        return float(model.predict_proba(transformed)[0, 1])

    original = predict_score(baseline)
    modified = predict_score(simulated)
    expected = sim["expected"]

    assert score_within_tolerance(
        round(original * 100, 2),
        expected["original_risk_percent"],
        golden["percent_tolerance"],
    )
    assert score_within_tolerance(
        round(modified * 100, 2),
        expected["simulated_risk_percent"],
        golden["percent_tolerance"],
    )
    assert score_within_tolerance(
        round(modified * 100, 2) - round(original * 100, 2),
        expected["delta_risk_percent"],
        golden["percent_tolerance"],
    )

    high_th = golden["risk_threshold_high"]
    med_th = golden["risk_threshold_medium"]
    assert (
        classify_risk_level(original, high_threshold=high_th, medium_threshold=med_th)
        == expected["original_risk_level"]
    )
    assert (
        classify_risk_level(modified, high_threshold=high_th, medium_threshold=med_th)
        == expected["simulated_risk_level"]
    )
