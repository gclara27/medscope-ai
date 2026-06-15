"""JWT validation and protected routes (T-122)."""

from datetime import UTC, datetime, timedelta

from jose import jwt

from core.config import settings
from models.role import Role
from models.user import User
from services.auth_service import AuthService


def _seed_user(db_session, *, password: str = "MedScope123!") -> User:
    role = Role(name="clinician")
    db_session.add(role)
    db_session.flush()
    auth = AuthService(db_session)
    user = User(
        role_id=role.id,
        first_name="Clara",
        last_name="Clinician",
        email="clinician@medscope.ai",
        password_hash=auth.hash_password(password),
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    return user


def _login_token(client, email: str, password: str) -> str:
    response = client.post("/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200
    return response.json()["access_token"]


def test_me_with_valid_token_returns_user(client, db_session) -> None:
    _seed_user(db_session)
    token = _login_token(client, "clinician@medscope.ai", "MedScope123!")

    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "clinician@medscope.ai"
    assert data["role"] == "clinician"


def test_me_without_token_returns_401(client) -> None:
    response = client.get("/auth/me")
    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"


def test_me_with_invalid_token_returns_401(client) -> None:
    response = client.get(
        "/auth/me",
        headers={"Authorization": "Bearer not-a-valid-jwt"},
    )
    assert response.status_code == 401


def test_me_with_expired_token_returns_401(client, db_session) -> None:
    user = _seed_user(db_session)
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


def test_me_with_inactive_user_returns_401(client, db_session) -> None:
    user = _seed_user(db_session)
    token = _login_token(client, "clinician@medscope.ai", "MedScope123!")
    user.is_active = False
    db_session.commit()

    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 401
