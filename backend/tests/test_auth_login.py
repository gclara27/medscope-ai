"""POST /auth/login endpoint tests (T-121)."""

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


def test_login_success_returns_jwt(client, db_session) -> None:
    _seed_user(db_session)

    response = client.post(
        "/auth/login",
        json={"email": "clinician@medscope.ai", "password": "MedScope123!"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["token_type"] == "bearer"
    assert data["expires_in"] == settings.jwt_expire_minutes * 60
    assert data["user"]["email"] == "clinician@medscope.ai"
    assert data["user"]["role"] == "clinician"
    assert data["user"]["first_name"] == "Clara"

    payload = jwt.decode(
        data["access_token"],
        settings.jwt_secret,
        algorithms=[settings.jwt_algorithm],
    )
    assert payload["sub"] == data["user"]["id"]
    assert payload["email"] == "clinician@medscope.ai"
    assert payload["role"] == "clinician"


def test_login_invalid_password_returns_401(client, db_session) -> None:
    _seed_user(db_session)

    response = client.post(
        "/auth/login",
        json={"email": "clinician@medscope.ai", "password": "wrong"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


def test_login_unknown_email_returns_401(client) -> None:
    response = client.post(
        "/auth/login",
        json={"email": "missing@medscope.ai", "password": "MedScope123!"},
    )

    assert response.status_code == 401


def test_login_inactive_user_returns_401(client, db_session) -> None:
    role = Role(name="nurse")
    db_session.add(role)
    db_session.flush()
    auth = AuthService(db_session)
    db_session.add(
        User(
            role_id=role.id,
            first_name="Nina",
            last_name="Nurse",
            email="nurse@medscope.ai",
            password_hash=auth.hash_password("MedScope123!"),
            is_active=False,
        )
    )
    db_session.commit()

    response = client.post(
        "/auth/login",
        json={"email": "nurse@medscope.ai", "password": "MedScope123!"},
    )

    assert response.status_code == 401


def test_login_missing_fields_returns_422(client) -> None:
    response = client.post("/auth/login", json={"email": "a@b.com"})
    assert response.status_code == 422
