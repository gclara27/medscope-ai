"""Authentication API tests — T-704, RTS-001, Testing.md §6.1, UC-001–003.

Checklist:
- login correcto → JWT
- login inválido → 401
- endpoint protegido sin token → 401
- rol sin permiso → 403
- logout (UC-002)
"""

from datetime import UTC, datetime, timedelta

import pytest
from fastapi.testclient import TestClient
from jose import jwt
from sqlalchemy import func, select

from core.config import settings
from models.audit_log import AuditLog

# --- Login (UC-001) ---


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


def test_login_jwt_payload_matches_user(
    client: TestClient,
    seed_user,
    login,
) -> None:
    user = seed_user(email="clinician@medscope.ai", role_name="clinician")

    response = login("clinician@medscope.ai")
    token = response.json()["access_token"]

    payload = jwt.decode(
        token,
        settings.jwt_secret,
        algorithms=[settings.jwt_algorithm],
    )
    assert payload["sub"] == str(user.id)
    assert payload["email"] == "clinician@medscope.ai"
    assert payload["role"] == "clinician"


def test_login_returns_effective_permissions(
    client: TestClient,
    seed_user,
    login,
) -> None:
    seed_user(email="nurse@medscope.ai", role_name="nurse")

    response = login("nurse@medscope.ai")
    permissions = response.json()["user"]["permissions"]

    assert permissions["dashboard"] is True
    assert permissions["history"] is True
    assert permissions["evaluation"] is False
    assert permissions["settings"] is False


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


def test_login_inactive_user_returns_401(
    client: TestClient,
    seed_user,
    login,
) -> None:
    seed_user(email="inactive@medscope.ai", role_name="nurse", is_active=False)

    response = login("inactive@medscope.ai")

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


@pytest.mark.parametrize(
    "payload",
    [
        {"email": "clinician@medscope.ai"},
        {"password": "MedScope123!"},
        {},
    ],
    ids=["missing-password", "missing-email", "empty-body"],
)
def test_login_missing_fields_returns_422(client: TestClient, payload: dict[str, str]) -> None:
    response = client.post("/auth/login", json=payload)
    assert response.status_code == 422


def test_successful_login_records_auth_login_audit(
    client: TestClient,
    db_session,
    seed_user,
    login,
) -> None:
    seed_user(email="audit@medscope.ai", role_name="clinician")

    response = login("audit@medscope.ai")

    assert response.status_code == 200
    count = db_session.scalar(
        select(func.count())
        .select_from(AuditLog)
        .where(AuditLog.action_type == "auth.login"),
    )
    assert count == 1


# --- JWT / protected routes (UC-080) ---


def test_me_with_valid_token_returns_user(
    client: TestClient,
    seed_user,
    auth_header,
) -> None:
    seed_user(
        email="clinician@medscope.ai",
        role_name="clinician",
        first_name="Clara",
        last_name="Clinician",
    )
    headers = auth_header("clinician@medscope.ai")

    response = client.get("/auth/me", headers=headers)

    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "clinician@medscope.ai"
    assert data["role"] == "clinician"
    assert data["first_name"] == "Clara"
    assert "permissions" in data


@pytest.mark.parametrize(
    "headers",
    [
        None,
        {"Authorization": "Bearer not-a-valid-jwt"},
        {"Authorization": "Token legacy-scheme"},
    ],
    ids=["no-header", "invalid-jwt", "wrong-scheme"],
)
def test_me_without_valid_bearer_returns_401(
    client: TestClient,
    headers: dict[str, str] | None,
) -> None:
    response = client.get("/auth/me", headers=headers)
    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"


def test_me_with_expired_token_returns_401(client: TestClient, seed_user) -> None:
    user = seed_user(email="clinician@medscope.ai", role_name="clinician")
    expired = datetime.now(UTC) - timedelta(seconds=1)
    token = jwt.encode(
        {
            "sub": str(user.id),
            "email": user.email,
            "role": "clinician",
            "exp": expired,
        },
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )

    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 401


def test_me_with_inactive_user_returns_401(
    client: TestClient,
    db_session,
    seed_user,
    auth_header,
) -> None:
    user = seed_user(email="clinician@medscope.ai", role_name="clinician")
    headers = auth_header("clinician@medscope.ai")
    user.is_active = False
    db_session.commit()

    response = client.get("/auth/me", headers=headers)

    assert response.status_code == 401


def test_protected_endpoint_without_token_returns_401(client: TestClient) -> None:
    for path in ("/auth/me", "/auth/logout", "/auth/admin/ping"):
        method = client.post if path.endswith("logout") else client.get
        response = method(path)
        assert response.status_code == 401
        assert response.json()["detail"] == "Not authenticated"


# --- Roles (UC-003) ---


def test_admin_ping_allows_admin(
    client: TestClient,
    seed_user,
    auth_header,
) -> None:
    seed_user(email="admin@medscope.ai", role_name="admin")
    headers = auth_header("admin@medscope.ai")

    response = client.get("/auth/admin/ping", headers=headers)

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "role": "admin"}


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


# --- Logout (UC-002) ---


def test_logout_with_valid_token_returns_200(
    client: TestClient,
    seed_user,
    auth_header,
    db_session,
) -> None:
    seed_user(email="clinician@medscope.ai", role_name="clinician")
    headers = auth_header("clinician@medscope.ai")

    response = client.post("/auth/logout", headers=headers)

    assert response.status_code == 200
    assert "Logged out successfully" in response.json()["message"]
    count = db_session.scalar(
        select(func.count())
        .select_from(AuditLog)
        .where(AuditLog.action_type == "auth.logout"),
    )
    assert count == 1


def test_logout_without_token_returns_401(client: TestClient) -> None:
    response = client.post("/auth/logout")
    assert response.status_code == 401


def test_full_auth_flow_login_me_logout(
    client: TestClient,
    seed_user,
    login,
) -> None:
    """UC-001 login → /me → UC-003 forbidden → UC-002 logout."""
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
