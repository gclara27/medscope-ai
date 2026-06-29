"""GET /admin/audit-logs API tests — T-X06-05, RBE-016, RF-075."""

from __future__ import annotations

from datetime import UTC, date, datetime, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from models.role import Role
from repositories.audit_log_repository import AuditLogRepository
from seeds.roles import SEED_ROLES


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


def _seed_logs(db_session, user_id) -> None:
    repo = AuditLogRepository(db_session)
    today = datetime.now(UTC)
    yesterday = today - timedelta(days=1)
    repo.create(
        user_id=user_id,
        action_type="auth.login",
        entity_type="user",
        entity_id=user_id,
        action_details={"email": "admin-audit@medscope.ai"},
    )
    log = repo.create(
        user_id=user_id,
        action_type="prediction.create",
        entity_type="prediction",
        action_details={"prediction_id": "abc-123", "risk_level": "medium"},
    )
    log.created_at = yesterday
    db_session.add(log)
    db_session.commit()


def test_audit_logs_require_admin(
    client: TestClient,
    seed_user,
    auth_header,
) -> None:
    seed_user(email="clinician-audit-api@medscope.ai", role_name="clinician")
    headers = auth_header("clinician-audit-api@medscope.ai")

    response = client.get("/admin/audit-logs", headers=headers)

    assert response.status_code == 403


def test_admin_can_list_audit_logs(
    client: TestClient,
    seed_user,
    auth_header,
    db_session,
) -> None:
    admin = seed_user(email="admin-audit-api@medscope.ai", role_name="admin")
    _seed_logs(db_session, admin.id)
    headers = auth_header("admin-audit-api@medscope.ai")

    response = client.get("/admin/audit-logs", headers=headers)

    assert response.status_code == 200
    body = response.json()
    assert body["total"] >= 2
    assert len(body["items"]) >= 2
    assert body["page"] == 1
    assert body["page_size"] == 50
    assert body["items"][0]["action_type"] in {
        "auth.login",
        "prediction.create",
        "auth.logout",
        "simulation.create",
    }
    assert "user" in body["items"][0]
    assert body["items"][0]["user"]["email"] == "admin-audit-api@medscope.ai"


def test_audit_logs_filter_by_action_type(
    client: TestClient,
    seed_user,
    auth_header,
    db_session,
) -> None:
    admin = seed_user(email="admin-audit-filter@medscope.ai", role_name="admin")
    _seed_logs(db_session, admin.id)
    headers = auth_header("admin-audit-filter@medscope.ai")

    response = client.get(
        "/admin/audit-logs",
        headers=headers,
        params={"action_type": "prediction.create"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 1
    assert body["items"][0]["action_type"] == "prediction.create"


def test_audit_logs_filter_by_date_range(
    client: TestClient,
    seed_user,
    auth_header,
    db_session,
) -> None:
    admin = seed_user(email="admin-audit-date@medscope.ai", role_name="admin")
    _seed_logs(db_session, admin.id)
    headers = auth_header("admin-audit-date@medscope.ai")
    yesterday = date.today() - timedelta(days=1)

    response = client.get(
        "/admin/audit-logs",
        headers=headers,
        params={
            "date_from": yesterday.isoformat(),
            "date_to": yesterday.isoformat(),
            "action_type": "prediction.create",
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 1
    assert body["items"][0]["action_type"] == "prediction.create"


def test_audit_logs_invalid_date_range_returns_422(
    client: TestClient,
    seed_user,
    auth_header,
) -> None:
    seed_user(email="admin-audit-range@medscope.ai", role_name="admin")
    headers = auth_header("admin-audit-range@medscope.ai")
    today = date.today()
    earlier = today - timedelta(days=2)

    response = client.get(
        "/admin/audit-logs",
        headers=headers,
        params={"date_from": today.isoformat(), "date_to": earlier.isoformat()},
    )

    assert response.status_code == 422


def test_audit_logs_invalid_action_type_returns_422(
    client: TestClient,
    seed_user,
    auth_header,
) -> None:
    seed_user(email="admin-audit-type@medscope.ai", role_name="admin")
    headers = auth_header("admin-audit-type@medscope.ai")

    response = client.get(
        "/admin/audit-logs",
        headers=headers,
        params={"action_type": "not.valid"},
    )

    assert response.status_code == 422


def test_audit_logs_pagination(
    client: TestClient,
    seed_user,
    auth_header,
    db_session,
) -> None:
    admin = seed_user(email="admin-audit-page@medscope.ai", role_name="admin")
    repo = AuditLogRepository(db_session)
    for index in range(3):
        repo.create(
            user_id=admin.id,
            action_type="auth.login",
            action_details={"index": index},
        )
    headers = auth_header("admin-audit-page@medscope.ai")

    response = client.get(
        "/admin/audit-logs",
        headers=headers,
        params={"page": 2, "page_size": 1, "action_type": "auth.login"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 4
    assert len(body["items"]) == 1
    assert body["page"] == 2
    assert body["page_size"] == 1
