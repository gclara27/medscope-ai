"""RTS-042 (partial) — ML model comparison API (T-X07-02, RF-077, UC-084)."""

from __future__ import annotations

import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from main import app
from models.role import Role
from routers.ml import get_ml_comparison_service
from seeds.permissions import DEFAULT_ROLE_PERMISSIONS
from seeds.roles import SEED_ROLES
from services.ml_comparison_service import MLComparisonService

SAMPLE_MANIFEST = {
    "model_id": "logistic_regression",
    "model_version": "1.0.0",
}

SAMPLE_BASELINE = {
    "primary_metric": "recall",
    "winner": "logistic_regression",
    "summary": "Logistic Regression wins on recall.",
    "logistic_regression": {
        "accuracy": 0.61,
        "recall": 0.54,
        "precision": 0.12,
        "f1": 0.20,
        "roc_auc": 0.61,
    },
    "random_forest": {
        "accuracy": 0.82,
        "recall": 0.20,
        "precision": 0.14,
        "f1": 0.17,
        "roc_auc": 0.59,
    },
}


@pytest.fixture(autouse=True)
def seed_standard_roles(db_session) -> None:
    for role_seed in SEED_ROLES:
        existing = db_session.scalar(select(Role).where(Role.name == role_seed["name"]))
        if existing is None:
            db_session.add(
                Role(
                    id=role_seed["id"],
                    name=role_seed["name"],
                    description=role_seed["description"],
                    permissions=dict(DEFAULT_ROLE_PERMISSIONS[role_seed["name"]]),
                ),
            )
        elif existing.permissions is None:
            existing.permissions = dict(DEFAULT_ROLE_PERMISSIONS[role_seed["name"]])
            db_session.add(existing)
    db_session.commit()


def _write_models_dir(tmp_path: Path) -> Path:
    (tmp_path / "model_manifest.json").write_text(json.dumps(SAMPLE_MANIFEST), encoding="utf-8")
    (tmp_path / "baseline_comparison.json").write_text(json.dumps(SAMPLE_BASELINE), encoding="utf-8")
    return tmp_path


def _auth_headers(client: TestClient, seed_user, *, email: str, role_name: str) -> dict[str, str]:
    seed_user(email=email, role_name=role_name)
    response = client.post("/auth/login", json={"email": email, "password": "MedScope123!"})
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_model_comparison_forbidden_for_clinician(
    client: TestClient,
    seed_user,
) -> None:
    headers = _auth_headers(
        client,
        seed_user,
        email="clinician-ml@medscope.ai",
        role_name="clinician",
    )
    response = client.get("/ml/models/comparison", headers=headers)
    assert response.status_code == 403


def test_model_comparison_forbidden_for_nurse(
    client: TestClient,
    seed_user,
) -> None:
    headers = _auth_headers(
        client,
        seed_user,
        email="nurse-ml@medscope.ai",
        role_name="nurse",
    )
    response = client.get("/ml/models/comparison", headers=headers)
    assert response.status_code == 403


def test_model_comparison_allowed_for_admin(
    client: TestClient,
    seed_user,
    tmp_path: Path,
) -> None:
    models_dir = _write_models_dir(tmp_path)
    app.dependency_overrides[get_ml_comparison_service] = lambda: MLComparisonService(models_dir)
    try:
        headers = _auth_headers(
            client,
            seed_user,
            email="admin-ml-compare@medscope.ai",
            role_name="admin",
        )
        response = client.get("/ml/models/comparison", headers=headers)
    finally:
        app.dependency_overrides.pop(get_ml_comparison_service, None)

    assert response.status_code == 200
    assert response.json()["is_available"] is True


def test_model_comparison_returns_payload_for_analyst(
    client: TestClient,
    seed_user,
    tmp_path: Path,
) -> None:
    models_dir = _write_models_dir(tmp_path)
    app.dependency_overrides[get_ml_comparison_service] = lambda: MLComparisonService(models_dir)
    try:
        headers = _auth_headers(
            client,
            seed_user,
            email="analyst-ml@medscope.ai",
            role_name="analyst",
        )
        response = client.get("/ml/models/comparison", headers=headers)
    finally:
        app.dependency_overrides.pop(get_ml_comparison_service, None)

    assert response.status_code == 200
    payload = response.json()
    assert payload["is_available"] is True
    assert payload["production_model_id"] == "logistic_regression"
    assert payload["recall_winner"] == "logistic_regression"
    assert len(payload["models"]) == 3
    logistic = next(item for item in payload["models"] if item["model_id"] == "logistic_regression")
    assert logistic["is_production"] is True
    assert logistic["metrics"]["recall"] == pytest.approx(0.54)
    assert payload["offline_note"]


def test_model_comparison_returns_unavailable_without_artifacts(
    client: TestClient,
    seed_user,
    tmp_path: Path,
) -> None:
    app.dependency_overrides[get_ml_comparison_service] = lambda: MLComparisonService(tmp_path)
    try:
        headers = _auth_headers(
            client,
            seed_user,
            email="admin-ml@medscope.ai",
            role_name="admin",
        )
        response = client.get("/ml/models/comparison", headers=headers)
    finally:
        app.dependency_overrides.pop(get_ml_comparison_service, None)

    assert response.status_code == 200
    payload = response.json()
    assert payload["is_available"] is False
    assert "model_manifest.json" in payload["missing_artifacts"]
    assert "baseline_comparison.json" in payload["missing_artifacts"]
