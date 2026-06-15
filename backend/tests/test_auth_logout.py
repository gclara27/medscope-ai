"""POST /auth/logout endpoint tests (T-124)."""

from models.role import Role
from models.user import User
from services.auth_service import AuthService


def _seed_user(db_session) -> User:
    role = Role(name="clinician")
    db_session.add(role)
    db_session.flush()
    auth = AuthService(db_session)
    user = User(
        role_id=role.id,
        first_name="Clara",
        last_name="Clinician",
        email="clinician@medscope.ai",
        password_hash=auth.hash_password("MedScope123!"),
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    return user


def _login_token(client) -> str:
    response = client.post(
        "/auth/login",
        json={"email": "clinician@medscope.ai", "password": "MedScope123!"},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def test_logout_with_valid_token_returns_200(client, db_session) -> None:
    _seed_user(db_session)
    token = _login_token(client)

    response = client.post(
        "/auth/logout",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    assert "Logged out successfully" in response.json()["message"]


def test_logout_without_token_returns_401(client) -> None:
    response = client.post("/auth/logout")
    assert response.status_code == 401
