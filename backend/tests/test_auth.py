"""Consolidated authentication API tests — T-126, Testing.md §6.1, UC-001–003."""

import pytest
from fastapi.testclient import TestClient

from core.config import settings

# Testing.md §6.1 checklist:
# - login correcto → JWT
# - login inválido → 401
# - endpoint protegido sin token → 401
# - rol sin permiso → 403
# - logout (UC-002)


@pytest.mark.parametrize(
    ("role_name", "email"),
    [
        ("admin", "admin@medscope.ai"),
        ("clinician", "clinician@medscope.ai"),
        ("analyst", "analyst@medscope.ai"),
        ("nurse", "nurse@medscope.ai"),
    ],
)
def test_login_success_returns_jwt_for_all_roles(
    client: TestClient,
    seed_user,
    login,
    role_name: str,
    email: str,
) -> None:
    seed_user(email=email, role_name=role_name)

    response = login(email)

    assert response.status_code == 200
    data = response.json()
    assert data["token_type"] == "bearer"
    assert data["expires_in"] == settings.jwt_expire_minutes * 60
    assert data["user"]["email"] == email
    assert data["user"]["role"] == role_name
    assert data["access_token"]


@pytest.mark.parametrize(
    "payload",
    [
        {"email": "clinician@medscope.ai", "password": "wrong-password"},
        {"email": "missing@medscope.ai", "password": "MedScope123!"},
    ],
    ids=["invalid-password", "unknown-email"],
)
def test_login_invalid_credentials_returns_401(
    client: TestClient,
    seed_user,
    payload: dict[str, str],
) -> None:
    seed_user()

    response = client.post("/auth/login", json=payload)

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


def test_protected_endpoint_without_token_returns_401(client: TestClient) -> None:
    for path in ("/auth/me", "/auth/logout", "/auth/admin/ping"):
        method = client.post if path.endswith("logout") else client.get
        response = method(path)
        assert response.status_code == 401
        assert response.json()["detail"] == "Not authenticated"


@pytest.mark.parametrize(
    ("role_name", "email"),
    [
        ("clinician", "clinician@medscope.ai"),
        ("analyst", "analyst@medscope.ai"),
        ("nurse", "nurse@medscope.ai"),
    ],
)
def test_admin_endpoint_forbidden_for_non_admin_roles(
    client: TestClient,
    seed_user,
    auth_header,
    role_name: str,
    email: str,
) -> None:
    seed_user(email=email, role_name=role_name)
    headers = auth_header(email)

    response = client.get("/auth/admin/ping", headers=headers)

    assert response.status_code == 403
    assert response.json()["detail"] == "Insufficient permissions"


def test_full_auth_flow_login_me_logout(
    client: TestClient,
    seed_user,
    login,
) -> None:
    """UC-001 login → protected /me → UC-003 403 → UC-002 logout."""
    seed_user(
        email="clinician@medscope.ai",
        role_name="clinician",
        first_name="Clara",
        last_name="Clinician",
    )
    login_response = login("clinician@medscope.ai")
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    me_response = client.get("/auth/me", headers=headers)
    assert me_response.status_code == 200
    assert me_response.json()["role"] == "clinician"

    forbidden_response = client.get("/auth/admin/ping", headers=headers)
    assert forbidden_response.status_code == 403

    logout_response = client.post("/auth/logout", headers=headers)
    assert logout_response.status_code == 200
    assert "Logged out successfully" in logout_response.json()["message"]
