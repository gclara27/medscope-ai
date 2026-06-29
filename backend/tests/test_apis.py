"""Clinical MVP API tests — T-705, RTS-001, Testing.md §6.2–6.4.

Endpoints: POST /predict, POST /simulate, GET /history, GET /analytics.
"""

from __future__ import annotations

import uuid
from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func, select

from core.ml_registry import ml_registry
from models.patient_input import PatientInput
from models.prediction import Prediction
from models.shap_explanation import ShapExplanation
from models.simulation import Simulation

VALID_PREDICT_PAYLOAD = {
    "age": 65,
    "gender": "Female",
    "hospital_stay_days": 3,
    "medications_count": 8,
    "previous_admissions": 3,
    "glucose": 180,
    "blood_pressure": 120,
    "bmi": 28.4,
}


@pytest.fixture(scope="module", autouse=True)
def ensure_ml_loaded() -> None:
    if not ml_registry.is_ready:
        ml_registry.load()
    if not ml_registry.is_ready:
        pytest.skip(f"ML artifacts unavailable: {ml_registry.load_error}")


def _predict(client: TestClient, headers: dict[str, str]) -> dict:
    response = client.post("/predict", json=VALID_PREDICT_PAYLOAD, headers=headers)
    assert response.status_code == 200
    return response.json()


def _simulate(
    client: TestClient,
    headers: dict[str, str],
    prediction_id: str,
    modifications: dict[str, int | float],
) -> dict:
    response = client.post(
        "/simulate",
        json={"prediction_id": prediction_id, "modifications": modifications},
        headers=headers,
    )
    assert response.status_code == 200
    return response.json()


# --- POST /predict (UC-020–023, UC-030) ---


def test_predict_requires_authentication(client: TestClient) -> None:
    response = client.post("/predict", json=VALID_PREDICT_PAYLOAD)
    assert response.status_code == 401


def test_predict_valid_payload_returns_score_shap_and_persists(
    client: TestClient,
    auth_header,
    seed_user,
    db_session,
) -> None:
    user = seed_user(email="api-clinician@medscope.ai", role_name="clinician")
    headers = auth_header("api-clinician@medscope.ai")

    before = db_session.scalar(select(func.count()).select_from(Prediction)) or 0
    data = _predict(client, headers)
    after = db_session.scalar(select(func.count()).select_from(Prediction)) or 0

    assert after == before + 1
    assert 0.0 <= data["risk_score"] <= 1.0
    assert data["risk_level"] in {"low", "medium", "high"}
    assert 0 <= data["prediction_time_ms"] < 1000
    assert len(data["shap_explanations"]) >= 1
    assert data["shap_explanations"][0]["importance_rank"] == 1

    prediction = db_session.get(Prediction, uuid.UUID(data["id"]))
    assert prediction is not None
    assert prediction.user_id == user.id

    patient_input = db_session.scalar(
        select(PatientInput).where(PatientInput.prediction_id == prediction.id),
    )
    assert patient_input is not None
    assert patient_input.age == VALID_PREDICT_PAYLOAD["age"]

    shap_count = db_session.scalar(
        select(func.count())
        .select_from(ShapExplanation)
        .where(ShapExplanation.prediction_id == prediction.id),
    )
    assert shap_count == len(data["shap_explanations"])


def test_predict_invalid_payload_returns_422(
    client: TestClient,
    auth_header,
    seed_user,
) -> None:
    seed_user(email="api-clinician@medscope.ai", role_name="clinician")
    headers = auth_header("api-clinician@medscope.ai")

    response = client.post(
        "/predict",
        json={**VALID_PREDICT_PAYLOAD, "age": -1},
        headers=headers,
    )
    assert response.status_code == 422


def test_predict_forbids_analyst_role(
    client: TestClient,
    seed_user,
    auth_header,
) -> None:
    seed_user(email="api-analyst@medscope.ai", role_name="analyst")
    headers = auth_header("api-analyst@medscope.ai")

    response = client.post("/predict", json=VALID_PREDICT_PAYLOAD, headers=headers)
    assert response.status_code == 403


# --- POST /simulate (UC-040–044) ---


def test_simulate_requires_authentication(client: TestClient) -> None:
    response = client.post(
        "/simulate",
        json={
            "prediction_id": str(uuid.uuid4()),
            "modifications": {"previous_admissions": 0},
        },
    )
    assert response.status_code == 401


def test_simulate_valid_payload_returns_comparison_and_persists(
    client: TestClient,
    auth_header,
    seed_user,
    db_session,
) -> None:
    seed_user(email="api-sim@medscope.ai", role_name="clinician")
    headers = auth_header("api-sim@medscope.ai")
    prediction = _predict(client, headers)

    before = db_session.scalar(select(func.count()).select_from(Simulation)) or 0
    data = _simulate(client, headers, prediction["id"], {"previous_admissions": 0})
    after = db_session.scalar(select(func.count()).select_from(Simulation)) or 0

    assert after == before + 1
    assert data["prediction_id"] == prediction["id"]
    assert data["delta_risk_percent"] == pytest.approx(
        data["simulated_risk_percent"] - data["original_risk_percent"],
        abs=0.01,
    )
    assert data["changes"][0]["feature_name"] == "previous_admissions"
    assert data["simulation_summary"]


def test_simulate_empty_modifications_returns_422(
    client: TestClient,
    auth_header,
    seed_user,
) -> None:
    seed_user(email="api-sim@medscope.ai", role_name="clinician")
    headers = auth_header("api-sim@medscope.ai")
    prediction = _predict(client, headers)

    response = client.post(
        "/simulate",
        json={"prediction_id": prediction["id"], "modifications": {}},
        headers=headers,
    )
    assert response.status_code == 422


def test_simulate_unknown_prediction_returns_404(
    client: TestClient,
    auth_header,
    seed_user,
) -> None:
    seed_user(email="api-sim@medscope.ai", role_name="clinician")
    headers = auth_header("api-sim@medscope.ai")

    response = client.post(
        "/simulate",
        json={
            "prediction_id": str(uuid.uuid4()),
            "modifications": {"glucose": 120},
        },
        headers=headers,
    )
    assert response.status_code == 404


def test_simulate_forbids_analyst_role(
    client: TestClient,
    seed_user,
    auth_header,
) -> None:
    seed_user(email="api-analyst-sim@medscope.ai", role_name="analyst")
    headers = auth_header("api-analyst-sim@medscope.ai")

    response = client.post(
        "/simulate",
        json={
            "prediction_id": str(uuid.uuid4()),
            "modifications": {"glucose": 120},
        },
        headers=headers,
    )
    assert response.status_code == 403


# --- GET /history (UC-050–052) ---


def test_history_requires_authentication(client: TestClient) -> None:
    assert client.get("/history").status_code == 401
    assert client.get(f"/history/{uuid.uuid4()}").status_code == 401


def test_history_lists_and_details_match_predict_response(
    client: TestClient,
    auth_header,
    seed_user,
) -> None:
    seed_user(email="api-history@medscope.ai", role_name="clinician")
    headers = auth_header("api-history@medscope.ai")
    prediction = _predict(client, headers)

    listing = client.get("/history", headers=headers)
    assert listing.status_code == 200
    items = listing.json()["items"]
    assert any(item["id"] == prediction["id"] for item in items)

    detail = client.get(f"/history/{prediction['id']}", headers=headers)
    assert detail.status_code == 200
    detail_data = detail.json()
    assert detail_data["risk_percent"] == pytest.approx(prediction["risk_percent"], rel=1e-4)
    assert detail_data["patient_input"]["glucose"] == VALID_PREDICT_PAYLOAD["glucose"]
    assert len(detail_data["shap_explanations"]) >= 1


def test_history_filter_by_risk_level(
    client: TestClient,
    auth_header,
    seed_user,
) -> None:
    seed_user(email="api-history@medscope.ai", role_name="clinician")
    headers = auth_header("api-history@medscope.ai")
    prediction = _predict(client, headers)

    response = client.get(
        f"/history?risk_level={prediction['risk_level']}",
        headers=headers,
    )
    assert response.status_code == 200
    assert all(item["risk_level"] == prediction["risk_level"] for item in response.json()["items"])


def test_history_invalid_date_range_returns_422(
    client: TestClient,
    auth_header,
    seed_user,
) -> None:
    seed_user(email="api-admin-hist@medscope.ai", role_name="admin")
    headers = auth_header("api-admin-hist@medscope.ai")
    today = date.today()
    earlier = today - timedelta(days=3)

    response = client.get(
        f"/history?date_from={today.isoformat()}&date_to={earlier.isoformat()}",
        headers=headers,
    )
    assert response.status_code == 422


@pytest.mark.parametrize(
    ("role_name", "email", "expected_status"),
    [
        ("analyst", "api-analyst-hist@medscope.ai", 403),
        ("nurse", "api-nurse-hist@medscope.ai", 200),
    ],
)
def test_history_role_access(
    client: TestClient,
    seed_user,
    auth_header,
    role_name: str,
    email: str,
    expected_status: int,
) -> None:
    seed_user(email="api-clinician-hist@medscope.ai", role_name="clinician")
    clinician_headers = auth_header("api-clinician-hist@medscope.ai")
    _predict(client, clinician_headers)

    seed_user(email=email, role_name=role_name)
    headers = auth_header(email)

    response = client.get("/history", headers=headers)
    assert response.status_code == expected_status


def test_history_detail_includes_linked_simulation(
    client: TestClient,
    auth_header,
    seed_user,
) -> None:
    seed_user(email="api-detail@medscope.ai", role_name="clinician")
    headers = auth_header("api-detail@medscope.ai")
    prediction = _predict(client, headers)
    simulation = _simulate(client, headers, prediction["id"], {"previous_admissions": 0})

    detail = client.get(f"/history/{prediction['id']}", headers=headers)
    assert detail.status_code == 200
    simulations = detail.json()["simulations"]
    assert len(simulations) == 1
    assert simulations[0]["id"] == simulation["id"]


def test_history_detail_not_found(
    client: TestClient,
    auth_header,
    seed_user,
) -> None:
    seed_user(email="api-admin-hist@medscope.ai", role_name="admin")
    headers = auth_header("api-admin-hist@medscope.ai")

    response = client.get(f"/history/{uuid.uuid4()}", headers=headers)
    assert response.status_code == 404


# --- GET /analytics (UC-060–062) ---


def test_analytics_requires_authentication(client: TestClient) -> None:
    assert client.get("/analytics").status_code == 401


def test_analytics_returns_summary_distribution_and_trend(
    client: TestClient,
    auth_header,
    seed_user,
) -> None:
    seed_user(email="api-clinician-an@medscope.ai", role_name="clinician")
    clinician_headers = auth_header("api-clinician-an@medscope.ai")
    _predict(client, clinician_headers)

    seed_user(email="api-analyst-an@medscope.ai", role_name="analyst")
    headers = auth_header("api-analyst-an@medscope.ai")

    response = client.get("/analytics", headers=headers)
    assert response.status_code == 200
    data = response.json()

    assert data["summary"]["total_predictions"] >= 1
    assert len(data["risk_distribution"]) == 3
    assert {item["risk_level"] for item in data["risk_distribution"]} == {
        "low",
        "medium",
        "high",
    }
    assert sum(item["count"] for item in data["risk_distribution"]) == data["summary"]["total_predictions"]
    assert len(data["trend"]) >= 1


def test_analytics_date_filter(
    client: TestClient,
    auth_header,
    seed_user,
) -> None:
    seed_user(email="api-clinician-an@medscope.ai", role_name="clinician")
    _predict(client, auth_header("api-clinician-an@medscope.ai"))

    seed_user(email="api-analyst-an@medscope.ai", role_name="analyst")
    headers = auth_header("api-analyst-an@medscope.ai")
    today = date.today()

    in_range = client.get(
        f"/analytics?date_from={today.isoformat()}&date_to={today.isoformat()}",
        headers=headers,
    )
    assert in_range.status_code == 200
    assert in_range.json()["summary"]["total_predictions"] >= 1

    past_end = today - timedelta(days=20)
    past_start = today - timedelta(days=30)
    empty = client.get(
        f"/analytics?date_from={past_start.isoformat()}&date_to={past_end.isoformat()}",
        headers=headers,
    )
    assert empty.status_code == 200
    assert empty.json()["summary"]["total_predictions"] == 0


def test_analytics_invalid_date_range_returns_422(
    client: TestClient,
    auth_header,
    seed_user,
) -> None:
    seed_user(email="api-analyst-an@medscope.ai", role_name="analyst")
    headers = auth_header("api-analyst-an@medscope.ai")
    today = date.today()
    earlier = today - timedelta(days=4)

    response = client.get(
        f"/analytics?date_from={today.isoformat()}&date_to={earlier.isoformat()}",
        headers=headers,
    )
    assert response.status_code == 422


@pytest.mark.parametrize(
    ("role_name", "email", "expected_status"),
    [
        ("analyst", "api-analyst-an@medscope.ai", 200),
        ("admin", "api-admin-an@medscope.ai", 200),
        ("nurse", "api-nurse-an@medscope.ai", 403),
        ("clinician", "api-clinician-an@medscope.ai", 403),
    ],
)
def test_analytics_role_access(
    client: TestClient,
    seed_user,
    auth_header,
    role_name: str,
    email: str,
    expected_status: int,
) -> None:
    seed_user(email=email, role_name=role_name)
    headers = auth_header(email)

    response = client.get("/analytics", headers=headers)
    assert response.status_code == expected_status


# --- MVP clinical flow ---


def test_mvp_clinical_api_flow_predict_simulate_history_analytics(
    client: TestClient,
    auth_header,
    seed_user,
) -> None:
    """UC-022 → UC-042 → UC-050 → UC-060 integration across MVP APIs."""
    seed_user(email="flow-clinician@medscope.ai", role_name="clinician")
    clinician_headers = auth_header("flow-clinician@medscope.ai")

    prediction = _predict(client, clinician_headers)
    simulation = _simulate(
        client,
        clinician_headers,
        prediction["id"],
        {"previous_admissions": 0},
    )

    history = client.get("/history", headers=clinician_headers)
    assert history.status_code == 200
    assert any(item["id"] == prediction["id"] for item in history.json()["items"])

    detail = client.get(f"/history/{prediction['id']}", headers=clinician_headers)
    assert detail.status_code == 200
    assert detail.json()["simulations"][0]["id"] == simulation["id"]

    seed_user(email="flow-analyst@medscope.ai", role_name="analyst")
    analytics = client.get("/analytics", headers=auth_header("flow-analyst@medscope.ai"))
    assert analytics.status_code == 200
    assert analytics.json()["summary"]["total_predictions"] >= 1
