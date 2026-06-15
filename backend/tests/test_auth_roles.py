"""Role-based authorization tests (T-123)."""

from models.role import Role
from models.user import User
from services.auth_service import AuthService


def _seed_user(db_session, *, email: str, role_name: str) -> User:
    role = Role(name=role_name)
    db_session.add(role)
    db_session.flush()
    auth = AuthService(db_session)
    user = User(
        role_id=role.id,
        first_name="Test",
        last_name="User",
        email=email,
        password_hash=auth.hash_password("MedScope123!"),
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    return user


def _login_token(client, email: str) -> str:
    response = client.post(
        "/auth/login",
        json={"email": email, "password": "MedScope123!"},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def test_admin_ping_allows_admin(client, db_session) -> None:
    _seed_user(db_session, email="admin@medscope.ai", role_name="admin")
    token = _login_token(client, "admin@medscope.ai")

    response = client.get(
        "/auth/admin/ping",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "role": "admin"}


def test_admin_ping_forbids_clinician(client, db_session) -> None:
    _seed_user(db_session, email="clinician@medscope.ai", role_name="clinician")
    token = _login_token(client, "clinician@medscope.ai")

    response = client.get(
        "/auth/admin/ping",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Insufficient permissions"


def test_admin_ping_without_token_returns_401(client) -> None:
    response = client.get("/auth/admin/ping")
    assert response.status_code == 401
