"""SQLAlchemy engine, session factory, and FastAPI DB dependency."""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from core.config import settings


class Base(DeclarativeBase):
    """Declarative base for ORM models (T-111+)."""


engine = create_engine(settings.database_url, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """Yield a database session per request; close when done."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
