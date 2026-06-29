"""Audit router hooks integration tests — T-X06-04, UC-081."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func, select

from core.ml_registry import ml_registry
from models.audit_log import AuditLog
from models.role import Role
from models.user import User
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
                ),
            )
    db_session.commit()


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
        last_name="Hook",
        email=email,
        password_hash=auth.hash_password(password),
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def test_successful_login_records_auth_login(client, db_session) -> None:
    _seed_user(db_session, email="audit-login@medscope.ai", role_name="clinician")

    response = client.post(
        "/auth/login",
        json={"email": "audit-login@medscope.ai", "password": "MedScope123!"},
    )

    assert response.status_code == 200
    assert _audit_count(db_session, "auth.login") == 1


def test_failed_login_does_not_record_audit_log(client, db_session) -> None:
    _seed_user(db_session, email="audit-fail@medscope.ai", role_name="clinician")

    response = client.post(
        "/auth/login",
        json={"email": "audit-fail@medscope.ai", "password": "wrong-password"},
    )

    assert response.status_code == 401
    assert _audit_count(db_session, "auth.login") == 0


def test_logout_records_auth_logout(client, db_session, auth_header) -> None:
    _seed_user(db_session, email="audit-logout@medscope.ai", role_name="clinician")
    headers = auth_header("audit-logout@medscope.ai")

    response = client.post("/auth/logout", headers=headers)

    assert response.status_code == 200
    assert _audit_count(db_session, "auth.logout") == 1


@pytest.fixture(scope="module", autouse=True)
def ensure_ml_loaded() -> None:
    if not ml_registry.is_ready:
        ml_registry.load()
    if not ml_registry.is_ready:
        pytest.skip(f"ML artifacts unavailable: {ml_registry.load_error}")


def test_predict_records_prediction_create(
    client: TestClient,
    db_session,
    auth_header,
) -> None:
    _seed_user(db_session, email="audit-predict@medscope.ai", role_name="clinician")
    headers = auth_header("audit-predict@medscope.ai")

    response = client.post("/predict", json=VALID_PREDICT_PAYLOAD, headers=headers)

    assert response.status_code == 200
    assert _audit_count(db_session, "prediction.create") == 1
    log = db_session.scalars(
        select(AuditLog).where(AuditLog.action_type == "prediction.create"),
    ).first()
    assert log is not None
    assert log.action_details is not None
    assert "glucose" not in log.action_details
    assert log.action_details["prediction_id"] == response.json()["id"]


def test_admin_user_create_records_audit_log(
    client: TestClient,
    db_session,
    auth_header,
) -> None:
    _seed_user(db_session, email="audit-admin@medscope.ai", role_name="admin")
    headers = auth_header("audit-admin@medscope.ai")

    response = client.post(
        "/admin/users",
        headers=headers,
        json={
            "email": "audit-created@medscope.ai",
            "password": "MedScope123!",
            "first_name": "Created",
            "last_name": "User",
            "role": "nurse",
        },
    )

    assert response.status_code == 201
    assert _audit_count(db_session, "admin.user.create") == 1
    log = db_session.scalars(
        select(AuditLog).where(AuditLog.action_type == "admin.user.create"),
    ).first()
    assert log is not None
    assert log.action_details is not None
    assert "password" not in log.action_details
