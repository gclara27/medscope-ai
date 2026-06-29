"""Performance middleware and RNF budget tests (T-703)."""

from __future__ import annotations

import time

import pytest
from fastapi.testclient import TestClient

from core.ml_registry import ml_registry
from core.performance_middleware import PROCESS_TIME_HEADER

VALID_PREDICT_PAYLOAD = {
    "age": 65,
    "gender": "Female",
    "hospital_stay_days": 3,
    "medications_count": 8,
    "previous_admissions": 1,
    "glucose": 140,
    "blood_pressure": 120,
    "bmi": 28.4,
}


@pytest.fixture(scope="module", autouse=True)
def ensure_ml_loaded() -> None:
    if not ml_registry.is_ready:
        ml_registry.load()
    if not ml_registry.is_ready:
        pytest.skip(f"ML artifacts unavailable: {ml_registry.load_error}")


def test_responses_include_process_time_header(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert PROCESS_TIME_HEADER in response.headers
    assert float(response.headers[PROCESS_TIME_HEADER]) >= 0.0


def test_predict_responds_within_rnf001_budget(
    client: TestClient,
    auth_header,
    seed_user,
) -> None:
    """POST /predict should complete within 1 second (RNF-001, T-703)."""
    seed_user(email="clinician-predict-perf@medscope.ai", role_name="clinician")
    headers = auth_header("clinician-predict-perf@medscope.ai")

    started = time.perf_counter()
    response = client.post("/predict", json=VALID_PREDICT_PAYLOAD, headers=headers)
    elapsed = time.perf_counter() - started

    assert response.status_code == 200
    assert elapsed < 1.0, f"Prediction took {elapsed:.3f}s"
    assert response.headers[PROCESS_TIME_HEADER]
    assert int(response.json()["prediction_time_ms"]) < 1000
