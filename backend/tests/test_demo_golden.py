"""Demo golden predictions API tests — T-902."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from core.ml_registry import ml_registry
from models.system_setting import SystemSetting
from repositories.system_settings_repository import SystemSettingsRepository
from seeds.system_settings import SYSTEM_SETTING_DEFAULTS

GOLDEN_PATH_ERROR = "models/demo_golden_predictions.json"


@pytest.fixture(scope="module", autouse=True)
def ensure_ml_loaded() -> None:
    if not ml_registry.is_ready:
        ml_registry.load()
    if not ml_registry.is_ready:
        pytest.skip(f"ML artifacts unavailable: {ml_registry.load_error}")


@pytest.fixture(autouse=True)
def seed_system_settings(db_session) -> None:
    SystemSettingsRepository(db_session).ensure_defaults()
    db_session.commit()


def _load_golden() -> dict:
    from ml.demo_golden import load_demo_golden

    return load_demo_golden()


@pytest.mark.parametrize(
    "scenario_id",
    ["high-readmission", "moderate-risk", "low-risk-stable"],
)
def test_demo_predict_matches_golden_scores(
    client: TestClient,
    scenario_id: str,
) -> None:
    from ml.demo_golden import score_within_tolerance

    golden = _load_golden()
    scenario = golden["scenarios"][scenario_id]
    expected = scenario["expected"]

    response = client.post("/demo/predict", json=scenario["payload"])

    assert response.status_code == 200
    data = response.json()
    assert data["model_version"] == golden["model_version"]
    assert score_within_tolerance(data["risk_score"], expected["risk_score"], golden["score_tolerance"])
    assert score_within_tolerance(
        data["risk_percent"],
        expected["risk_percent"],
        golden["percent_tolerance"],
    )
    assert data["risk_level"] == expected["risk_level"]
    assert len(data["shap_explanations"]) >= 1


def test_demo_simulate_matches_golden_delta(client: TestClient) -> None:
    from ml.demo_golden import score_within_tolerance

    golden = _load_golden()
    sim = golden["simulation"]
    baseline_payload = golden["scenarios"][sim["baseline_scenario"]]["payload"]
    expected = sim["expected"]

    response = client.post(
        "/demo/simulate",
        json={
            "baseline": baseline_payload,
            "modifications": sim["modifications"],
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["model_version"] == golden["model_version"]
    assert score_within_tolerance(
        data["original_risk_percent"],
        expected["original_risk_percent"],
        golden["percent_tolerance"],
    )
    assert score_within_tolerance(
        data["simulated_risk_percent"],
        expected["simulated_risk_percent"],
        golden["percent_tolerance"],
    )
    assert score_within_tolerance(
        data["delta_risk_percent"],
        expected["delta_risk_percent"],
        golden["percent_tolerance"],
    )
    assert data["original_risk_level"] == expected["original_risk_level"]
    assert data["simulated_risk_level"] == expected["simulated_risk_level"]


def test_manifest_checksums_match_pinned_artifacts() -> None:
    from ml.training.serialize import load_production_manifest, validate_production_artifacts

    manifest = load_production_manifest()
    assert manifest.get("demo_golden_file") == "demo_golden_predictions.json"
    assert isinstance(manifest.get("artifact_sha256"), dict)
    validate_production_artifacts()


def test_changing_risk_thresholds_does_not_change_model_version(client: TestClient, db_session) -> None:
    """Golden scores are model outputs; thresholds only affect risk_level banding."""
    golden = _load_golden()
    scenario = golden["scenarios"]["high-readmission"]

    response = client.post("/demo/predict", json=scenario["payload"])
    assert response.status_code == 200
    assert response.json()["model_version"] == "1.0.0"

    setting = db_session.scalar(
        select(SystemSetting).where(SystemSetting.key == "risk_threshold_high"),
    )
    assert setting is not None
    setting.value = 0.9
    db_session.commit()

    response_after = client.post("/demo/predict", json=scenario["payload"])
    assert response_after.status_code == 200
    assert response_after.json()["risk_score"] == response.json()["risk_score"]
    assert response_after.json()["model_version"] == "1.0.0"
