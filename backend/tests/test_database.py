"""Database session dependency."""

from core.database import get_db


def test_get_db_yields_session_and_closes() -> None:
    db_gen = get_db()
    session = next(db_gen)

    assert session is not None
    db_gen.close()
