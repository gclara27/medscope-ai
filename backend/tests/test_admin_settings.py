"""Admin settings API tests — T-X02, RF-071, UC-071."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select


@pytest.fixture(autouse=True)
def seed_standard_roles(db_session) -> None:
    """Ensure MVP roles exist with default permissions."""
    import json

    from models.role import Role
    from seeds.permissions import DEFAULT_ROLE_PERMISSIONS
    from seeds.roles import SEED_ROLES

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


def test_role_policies_require_settings_permission(
    client: TestClient,
    seed_user,
    auth_header,
) -> None:
    seed_user(email="clinician-settings@medscope.ai", role_name="clinician")
    headers = auth_header("clinician-settings@medscope.ai")

    response = client.get("/admin/roles", headers=headers)

    assert response.status_code == 403


def test_admin_can_list_and_update_role_policies(
    client: TestClient,
    seed_user,
    auth_header,
    db_session,
) -> None:
    from models.role import Role

    seed_user(email="admin-settings@medscope.ai", role_name="admin")
    headers = auth_header("admin-settings@medscope.ai")
    nurse_role = db_session.scalar(select(Role).where(Role.name == "nurse"))

    list_response = client.get("/admin/roles", headers=headers)
    assert list_response.status_code == 200
    body = list_response.json()
    assert len(body["items"]) >= 4
    nurse_item = next(item for item in body["items"] if item["name"] == "nurse")
    assert nurse_item["permissions"]["history"] is True

    update_response = client.patch(
        f"/admin/roles/{nurse_role.id}",
        headers=headers,
        json={"permissions": {"history": False}},
    )
    assert update_response.status_code == 200
    assert update_response.json()["permissions"]["history"] is False


def test_admin_role_policy_is_locked(
    client: TestClient,
    seed_user,
    auth_header,
    db_session,
) -> None:
    from models.role import Role

    admin = seed_user(email="admin-lock@medscope.ai", role_name="admin")
    headers = auth_header("admin-lock@medscope.ai")
    admin_role = db_session.scalar(select(Role).where(Role.name == "admin"))

    response = client.patch(
        f"/admin/roles/{admin_role.id}",
        headers=headers,
        json={"permissions": {"settings": False}},
    )

    assert response.status_code == 400
    assert "cannot be modified" in response.json()["detail"]


def test_admin_can_read_and_update_system_settings(
    client: TestClient,
    seed_user,
    auth_header,
) -> None:
    seed_user(email="admin-config@medscope.ai", role_name="admin")
    headers = auth_header("admin-config@medscope.ai")

    get_response = client.get("/admin/settings", headers=headers)
    assert get_response.status_code == 200
    settings = get_response.json()
    assert settings["platform_name"] == "MedScope AI"
    assert settings["risk_threshold_high"] == 0.5
    assert settings["risk_threshold_medium"] == 0.35
    assert "model" in settings

    patch_response = client.patch(
        "/admin/settings",
        headers=headers,
        json={
            "platform_name": "MedScope AI Demo",
            "risk_threshold_high": 0.55,
            "risk_threshold_medium": 0.3,
        },
    )
    assert patch_response.status_code == 200
    updated = patch_response.json()
    assert updated["platform_name"] == "MedScope AI Demo"
    assert updated["risk_threshold_high"] == 0.55
    assert updated["risk_threshold_medium"] == 0.3


def test_system_settings_validate_threshold_order(
    client: TestClient,
    seed_user,
    auth_header,
) -> None:
    seed_user(email="admin-threshold@medscope.ai", role_name="admin")
    headers = auth_header("admin-threshold@medscope.ai")

    response = client.patch(
        "/admin/settings",
        headers=headers,
        json={"risk_threshold_high": 0.4, "risk_threshold_medium": 0.45},
    )

    assert response.status_code == 400
    assert "lower than" in response.json()["detail"]


def test_login_includes_permissions(
    client: TestClient,
    seed_user,
    login,
) -> None:
    seed_user(email="nurse-login@medscope.ai", role_name="nurse")
    response = login("nurse-login@medscope.ai", "MedScope123!")

    assert response.status_code == 200
    user = response.json()["user"]
    assert user["permissions"]["dashboard"] is True
    assert user["permissions"]["evaluation"] is False
    assert user["permissions"]["settings"] is False
