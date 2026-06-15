"""AuthService bcrypt tests (T-120)."""

from models.role import Role
from models.user import User
from services.auth_service import AuthService


def _create_user(
    db_session,
    *,
    email: str = "clinician@medscope.ai",
    password: str = "MedScope123!",
    is_active: bool = True,
    role_name: str = "clinician",
) -> User:
    role = Role(name=role_name)
    db_session.add(role)
    db_session.flush()

    auth = AuthService(db_session)
    user = User(
        role_id=role.id,
        first_name="Test",
        last_name="User",
        email=email,
        password_hash=auth.hash_password(password),
        is_active=is_active,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def test_hash_password_produces_bcrypt_hash(db_session) -> None:
    auth = AuthService(db_session)
    hashed = auth.hash_password("MedScope123!")
    assert hashed.startswith("$2b$")


def test_authenticate_valid_credentials(db_session) -> None:
    _create_user(db_session)
    auth = AuthService(db_session)

    user = auth.authenticate("clinician@medscope.ai", "MedScope123!")

    assert user is not None
    assert user.email == "clinician@medscope.ai"
    assert user.role.name == "clinician"


def test_authenticate_email_case_insensitive(db_session) -> None:
    _create_user(db_session)
    auth = AuthService(db_session)

    user = auth.authenticate("  Clinician@MedScope.AI  ", "MedScope123!")

    assert user is not None
    assert user.email == "clinician@medscope.ai"


def test_authenticate_invalid_password(db_session) -> None:
    _create_user(db_session)
    auth = AuthService(db_session)

    assert auth.authenticate("clinician@medscope.ai", "wrong-password") is None


def test_authenticate_unknown_email(db_session) -> None:
    auth = AuthService(db_session)
    assert auth.authenticate("missing@medscope.ai", "MedScope123!") is None


def test_authenticate_inactive_user(db_session) -> None:
    _create_user(db_session, is_active=False)
    auth = AuthService(db_session)

    assert auth.authenticate("clinician@medscope.ai", "MedScope123!") is None
