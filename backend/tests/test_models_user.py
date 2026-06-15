"""User model tests (T-112)."""

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from models.role import Role
from models.user import User


def _create_role(db_session, name: str = "clinician") -> Role:
    role = Role(name=name)
    db_session.add(role)
    db_session.commit()
    return role


def test_user_create_with_role_fk(db_session) -> None:
    role = _create_role(db_session)
    user = User(
        role_id=role.id,
        first_name="Ana",
        last_name="García",
        email="clinician@medscope.ai",
        password_hash="$2b$12$hashedpasswordplaceholder",
    )
    db_session.add(user)
    db_session.commit()

    found = db_session.scalar(select(User).where(User.email == "clinician@medscope.ai"))
    assert found is not None
    assert found.role_id == role.id
    assert found.is_active is True
    assert found.password_hash.startswith("$2b$")


def test_user_role_relationship(db_session) -> None:
    role = _create_role(db_session, name="admin")
    user = User(
        role_id=role.id,
        first_name="Admin",
        last_name="User",
        email="admin@medscope.ai",
        password_hash="$2b$12$hash",
    )
    db_session.add(user)
    db_session.commit()

    db_session.refresh(user)
    assert user.role.name == "admin"
    assert len(role.users) == 1
    assert role.users[0].email == "admin@medscope.ai"


def test_user_email_unique(db_session) -> None:
    role = _create_role(db_session)
    db_session.add(
        User(
            role_id=role.id,
            first_name="A",
            last_name="B",
            email="duplicate@medscope.ai",
            password_hash="$2b$12$hash1",
        )
    )
    db_session.commit()

    db_session.add(
        User(
            role_id=role.id,
            first_name="C",
            last_name="D",
            email="duplicate@medscope.ai",
            password_hash="$2b$12$hash2",
        )
    )
    try:
        db_session.commit()
        raise AssertionError("Expected IntegrityError for duplicate email")
    except IntegrityError:
        db_session.rollback()
