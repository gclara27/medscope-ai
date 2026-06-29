"""RTS-041 — Audit logs integration tests (T-X06-07, UC-081, UC-085).

Covers automatic verification for:
- WRITE: router hooks persist audit events without PHI
- QUERY: GET /admin/audit-logs listing and filters
- RBAC: non-admin receives 403
"""

from __future__ import annotations

from datetime import UTC, date, datetime, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func, select

from core.ml_registry import ml_registry
from models.audit_log import AuditLog
from models.role import Role
from models.user import User
from repositories.audit_log_repository import AuditLogRepository
from seeds.permissions import DEFAULT_ROLE_PERMISSIONS
from seeds.roles import SEED_ROLES
from services.auth_service import AuthService

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


@pytest.fixture(scope="module", autouse=True)
def ensure_ml_loaded() -> None:
    if not ml_registry.is_ready:
        ml_registry.load()
    if not ml_registry.is_ready:
        pytest.skip(f"ML artifacts unavailable: {ml_registry.load_error}")


def _audit_count(db_session, action_type: str) -> int:
    return int(
        db_session.scalar(
            select(func.count()).select_from(AuditLog).where(AuditLog.action_type == action_type),
        )
        or 0,
    )


def _seed_user(db_session, *, email: str, role_name: str, password: str = "MedScope123!") -> User:
    role = db_session.scalar(select(Role).where(Role.name == role_name))
    assert role is not None
    auth = AuthService(db_session)
    user = User(
        role_id=role.id,
        first_name="Audit",
        last_name="RTS",
        email=email,
        password_hash=auth.hash_password(password),
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


# --- WRITE ---


def test_write_login_creates_auth_login_audit_log(client: TestClient, db_session) -> None:
    _seed_user(db_session, email="rts-login@medscope.ai", role_name="admin")

    response = client.post(
        "/auth/login",
        json={"email": "rts-login@medscope.ai", "password": "MedScope123!"},
    )

    assert response.status_code == 200
    assert _audit_count(db_session, "auth.login") == 1

    log = db_session.scalars(select(AuditLog).where(AuditLog.action_type == "auth.login")).first()
    assert log is not None
    assert log.action_details is not None
    assert "password" not in log.action_details
    assert response.json()["access_token"] not in str(log.action_details)


def test_write_predict_creates_prediction_audit_log_without_phi(
    client: TestClient,
    db_session,
    auth_header,
) -> None:
    _seed_user(db_session, email="rts-predict@medscope.ai", role_name="clinician")
    headers = auth_header("rts-predict@medscope.ai")

    response = client.post("/predict", json=VALID_PREDICT_PAYLOAD, headers=headers)

    assert response.status_code == 200
    log = db_session.scalars(
        select(AuditLog).where(AuditLog.action_type == "prediction.create"),
    ).first()
    assert log is not None
    assert log.action_details is not None
    assert log.action_details["prediction_id"] == response.json()["id"]
    for forbidden in ("glucose", "age", "bmi", "blood_pressure", "password"):
        assert forbidden not in log.action_details


def test_write_settings_update_creates_admin_settings_audit_log(
    client: TestClient,
    db_session,
    auth_header,
) -> None:
    _seed_user(db_session, email="rts-settings@medscope.ai", role_name="admin")
    headers = auth_header("rts-settings@medscope.ai")

    response = client.patch(
        "/admin/settings",
        headers=headers,
        json={"platform_name": "MedScope Audit Demo"},
    )

    assert response.status_code == 200
    log = db_session.scalars(
        select(AuditLog).where(AuditLog.action_type == "admin.settings.update"),
    ).first()
    assert log is not None
    assert log.action_details is not None
    assert "updated_fields" in log.action_details


# --- QUERY ---


def test_query_admin_audit_logs_returns_paginated_payload(
    client: TestClient,
    db_session,
    auth_header,
) -> None:
    admin = _seed_user(db_session, email="rts-query@medscope.ai", role_name="admin")
    AuditLogRepository(db_session).create(
        user_id=admin.id,
        action_type="auth.login",
        action_details={"email": admin.email},
    )
    headers = auth_header("rts-query@medscope.ai")

    response = client.get("/admin/audit-logs", headers=headers)

    assert response.status_code == 200
    body = response.json()
    assert body["total"] >= 1
    assert body["page"] == 1
    assert "items" in body
    assert body["items"][0]["action_type"]
    assert body["items"][0]["created_at"]
    assert body["items"][0]["user_id"]


def test_query_audit_logs_supports_action_and_date_filters(
    client: TestClient,
    db_session,
    auth_header,
) -> None:
    admin = _seed_user(db_session, email="rts-filter@medscope.ai", role_name="admin")
    repo = AuditLogRepository(db_session)
    repo.create(user_id=admin.id, action_type="auth.login")
    prediction_log = repo.create(user_id=admin.id, action_type="prediction.create")
    prediction_log.created_at = datetime.combine(
        date.today() - timedelta(days=1),
        datetime.min.time(),
        tzinfo=UTC,
    )
    db_session.add(prediction_log)
    db_session.commit()
    headers = auth_header("rts-filter@medscope.ai")
    yesterday = date.today() - timedelta(days=1)

    response = client.get(
        "/admin/audit-logs",
        headers=headers,
        params={
            "action_type": "prediction.create",
            "date_from": yesterday.isoformat(),
            "date_to": yesterday.isoformat(),
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 1
    assert body["items"][0]["action_type"] == "prediction.create"


# --- RBAC ---


def test_query_audit_logs_returns_403_for_non_admin(
    client: TestClient,
    db_session,
    auth_header,
) -> None:
    _seed_user(db_session, email="rts-rbac@medscope.ai", role_name="clinician")
    headers = auth_header("rts-rbac@medscope.ai")

    response = client.get("/admin/audit-logs", headers=headers)

    assert response.status_code == 403
