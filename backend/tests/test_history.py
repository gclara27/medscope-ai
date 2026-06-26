"""History API tests (T-306, T-314, UC-050–052, RF-051–052)."""

from __future__ import annotations

from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient

from core.ml_registry import ml_registry

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


def test_history_requires_authentication(client: TestClient) -> None:
    response = client.get("/history")
    assert response.status_code == 401


def test_history_returns_predictions_after_predict(
    client: TestClient,
    auth_header,
    seed_user,
) -> None:
    user = seed_user(email="clinician-history@medscope.ai", role_name="clinician")
    headers = auth_header("clinician-history@medscope.ai")

    predict = client.post("/predict", json=VALID_PREDICT_PAYLOAD, headers=headers)
    assert predict.status_code == 200
    predict_data = predict.json()

    response = client.get("/history", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert len(data["items"]) >= 1
    item = data["items"][0]
    assert item["id"] == predict_data["id"]
    assert item["risk_score"] == pytest.approx(predict_data["risk_score"], rel=1e-4)
    assert item["risk_percent"] == pytest.approx(predict_data["risk_percent"], rel=1e-4)
    assert item["user"]["id"] == str(user.id)
    assert item["user"]["email"] == user.email
    assert item["patient_input"]["age"] == VALID_PREDICT_PAYLOAD["age"]


def test_history_filter_by_risk_level(
    client: TestClient,
    auth_header,
    seed_user,
) -> None:
    seed_user(email="clinician-history@medscope.ai", role_name="clinician")
    headers = auth_header("clinician-history@medscope.ai")
    client.post("/predict", json=VALID_PREDICT_PAYLOAD, headers=headers)

    predict_data = client.post("/predict", json=VALID_PREDICT_PAYLOAD, headers=headers).json()
    risk_level = predict_data["risk_level"]

    response = client.get(f"/history?risk_level={risk_level}", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert all(item["risk_level"] == risk_level for item in data["items"])


def test_history_filter_by_user_id(
    client: TestClient,
    auth_header,
    seed_user,
    db_session,
) -> None:
    clinician = seed_user(email="hist-clinician@medscope.ai", role_name="clinician")
    clinician_headers = auth_header("hist-clinician@medscope.ai")
    client.post("/predict", json=VALID_PREDICT_PAYLOAD, headers=clinician_headers)

    seed_user(email="admin-history-filter@medscope.ai", role_name="admin")
    admin_headers = auth_header("admin-history-filter@medscope.ai")

    from models.user import User
    from services.auth_service import AuthService

    auth = AuthService(db_session)
    other = User(
        role_id=clinician.role_id,
        first_name="Other",
        last_name="Clinician",
        email="other-clinician@medscope.ai",
        password_hash=auth.hash_password("MedScope123!"),
        is_active=True,
    )
    db_session.add(other)
    db_session.commit()
    other_headers = auth_header("other-clinician@medscope.ai")
    client.post("/predict", json=VALID_PREDICT_PAYLOAD, headers=other_headers)

    response = client.get(f"/history?user_id={clinician.id}", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert all(item["user"]["id"] == str(clinician.id) for item in data["items"])
    assert all(item["user"]["id"] != str(other.id) for item in data["items"])


def test_history_invalid_date_range_returns_422(
    client: TestClient,
    auth_header,
    seed_user,
) -> None:
    seed_user(email="admin-history@medscope.ai", role_name="admin")
    headers = auth_header("admin-history@medscope.ai")
    today = date.today()
    earlier = today - timedelta(days=7)

    response = client.get(
        f"/history?date_from={today.isoformat()}&date_to={earlier.isoformat()}",
        headers=headers,
    )
    assert response.status_code == 422


def test_history_analyst_role_denied_without_permission(client: TestClient, db_session) -> None:
    from models.role import Role
    from models.user import User
    from services.auth_service import AuthService

    role = Role(name="analyst")
    db_session.add(role)
    db_session.flush()
    auth = AuthService(db_session)
    db_session.add(
        User(
            role_id=role.id,
            first_name="History",
            last_name="Analyst",
            email="history-analyst@medscope.ai",
            password_hash=auth.hash_password("MedScope123!"),
            is_active=True,
        )
    )
    db_session.commit()

    login = client.post(
        "/auth/login",
        json={"email": "history-analyst@medscope.ai", "password": "MedScope123!"},
    )
    token = login.json()["access_token"]
    response = client.get("/history", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403


def test_history_detail_requires_authentication(client: TestClient) -> None:
    response = client.get(f"/history/{__import__('uuid').uuid4()}")
    assert response.status_code == 401


def test_history_detail_returns_prediction_with_shap(
    client: TestClient,
    auth_header,
    seed_user,
) -> None:
    seed_user(email="clinician-detail@medscope.ai", role_name="clinician")
    headers = auth_header("clinician-detail@medscope.ai")

    predict = client.post("/predict", json=VALID_PREDICT_PAYLOAD, headers=headers)
    assert predict.status_code == 200
    predict_data = predict.json()
    prediction_id = predict_data["id"]

    response = client.get(f"/history/{prediction_id}", headers=headers)
    assert response.status_code == 200
    data = response.json()

    assert data["id"] == prediction_id
    assert data["risk_percent"] == pytest.approx(predict_data["risk_percent"], rel=1e-4)
    assert data["baseline_request"]["age"] == VALID_PREDICT_PAYLOAD["age"]
    assert data["patient_input"]["glucose"] == VALID_PREDICT_PAYLOAD["glucose"]
    assert len(data["shap_explanations"]) >= 1
    assert data["shap_explanations"][0]["feature_name"]
    assert data["simulations"] == []


def test_history_detail_includes_simulations(
    client: TestClient,
    auth_header,
    seed_user,
) -> None:
    seed_user(email="clinician-detail@medscope.ai", role_name="clinician")
    headers = auth_header("clinician-detail@medscope.ai")

    predict = client.post("/predict", json=VALID_PREDICT_PAYLOAD, headers=headers)
    prediction_id = predict.json()["id"]

    simulate = client.post(
        "/simulate",
        json={
            "prediction_id": prediction_id,
            "modifications": {"previous_admissions": 0},
        },
        headers=headers,
    )
    assert simulate.status_code == 200

    response = client.get(f"/history/{prediction_id}", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data["simulations"]) == 1
    simulation = data["simulations"][0]
    assert simulation["id"] == simulate.json()["id"]
    assert simulation["original_risk_percent"] == pytest.approx(
        simulate.json()["original_risk_percent"],
        rel=1e-4,
    )
    assert simulation["simulated_risk_percent"] == pytest.approx(
        simulate.json()["simulated_risk_percent"],
        rel=1e-4,
    )


def test_history_detail_not_found(
    client: TestClient,
    auth_header,
    seed_user,
) -> None:
    seed_user(email="admin-detail@medscope.ai", role_name="admin")
    headers = auth_header("admin-detail@medscope.ai")

    response = client.get(
        f"/history/{__import__('uuid').uuid4()}",
        headers=headers,
    )
    assert response.status_code == 404
