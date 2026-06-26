"""Admin user management API tests (T-X01, UC-070)."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select


@pytest.fixture(autouse=True)
def seed_standard_roles(db_session) -> None:
    """Ensure MVP roles exist for admin user management tests."""
    from models.role import Role
    from seeds.roles import SEED_ROLES

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


def test_list_users_requires_admin(
    client: TestClient,
    seed_user,
    auth_header,
) -> None:
    seed_user(email="clinician-users@medscope.ai", role_name="clinician")
    headers = auth_header("clinician-users@medscope.ai")

    response = client.get("/admin/users", headers=headers)

    assert response.status_code == 403


def test_admin_can_list_create_and_update_users(
    client: TestClient,
    seed_user,
    auth_header,
    login,
) -> None:
    admin = seed_user(
        email="admin-users@medscope.ai",
        role_name="admin",
        first_name="Admin",
        last_name="Users",
    )
    headers = auth_header("admin-users@medscope.ai")

    list_response = client.get("/admin/users", headers=headers)
    assert list_response.status_code == 200
    assert list_response.json()["total"] >= 1

    create_response = client.post(
        "/admin/users",
        headers=headers,
        json={
            "email": "nurse.new@medscope.ai",
            "password": "MedScope123!",
            "first_name": "Nora",
            "last_name": "Nurse",
            "role": "nurse",
        },
    )
    assert create_response.status_code == 201
    created = create_response.json()
    assert created["email"] == "nurse.new@medscope.ai"
    assert created["role"] == "nurse"
    assert created["is_active"] is True

    login_response = login("nurse.new@medscope.ai", "MedScope123!")
    assert login_response.status_code == 200

    update_response = client.patch(
        f"/admin/users/{created['id']}",
        headers=headers,
        json={"role": "analyst", "is_active": False},
    )
    assert update_response.status_code == 200
    body = update_response.json()
    assert body["role"] == "analyst"
    assert body["is_active"] is False

    login_response = login("nurse.new@medscope.ai", "MedScope123!")
    assert login_response.status_code == 401


def test_admin_cannot_deactivate_self(
    client: TestClient,
    seed_user,
    auth_header,
) -> None:
    admin = seed_user(email="admin-self@medscope.ai", role_name="admin")
    headers = auth_header("admin-self@medscope.ai")

    response = client.patch(
        f"/admin/users/{admin.id}",
        headers=headers,
        json={"is_active": False},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "You cannot deactivate your own account"


def test_create_user_rejects_duplicate_email(
    client: TestClient,
    seed_user,
    auth_header,
) -> None:
    seed_user(email="admin-dup@medscope.ai", role_name="admin")
    seed_user(email="existing@medscope.ai", role_name="nurse")
    headers = auth_header("admin-dup@medscope.ai")

    response = client.post(
        "/admin/users",
        headers=headers,
        json={
            "email": "existing@medscope.ai",
            "password": "MedScope123!",
            "first_name": "Dup",
            "last_name": "User",
            "role": "nurse",
        },
    )

    assert response.status_code == 409
    assert "already exists" in response.json()["detail"]


def test_cannot_remove_last_active_admin(
    client: TestClient,
    seed_user,
    auth_header,
) -> None:
    admin = seed_user(email="solo-admin@medscope.ai", role_name="admin")
    headers = auth_header("solo-admin@medscope.ai")

    demote_response = client.patch(
        f"/admin/users/{admin.id}",
        headers=headers,
        json={"role": "clinician"},
    )
    assert demote_response.status_code == 400
    assert "active administrator" in demote_response.json()["detail"]
