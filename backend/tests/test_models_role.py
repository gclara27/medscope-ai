"""Role model tests (T-111)."""

from sqlalchemy import select

from models.role import Role


def test_role_create_and_query(db_session) -> None:
    role = Role(name="clinician", description="Clinical decision support user")
    db_session.add(role)
    db_session.commit()

    found = db_session.scalar(select(Role).where(Role.name == "clinician"))
    assert found is not None
    assert found.id == role.id
    assert found.description == "Clinical decision support user"


def test_role_name_unique(db_session) -> None:
    db_session.add(Role(name="admin"))
    db_session.commit()

    db_session.add(Role(name="admin"))
    try:
        db_session.commit()
        raise AssertionError("Expected IntegrityError for duplicate role name")
    except Exception as exc:
        db_session.rollback()
        assert "UNIQUE" in str(exc).upper() or "IntegrityError" in type(exc).__name__
