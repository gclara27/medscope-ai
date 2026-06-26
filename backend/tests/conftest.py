"""Shared pytest fixtures for backend tests.

DB strategy (Testing.md §6.5):
- Unit tests use SQLite in-memory — no PostgreSQL required.
- Each test gets a fresh in-memory database for full isolation.
- Integration tests (optional) use PostgreSQL via Docker.
"""

from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

import models  # noqa: F401 — register ORM models with Base.metadata
from core.database import Base, get_db
from main import app

_TEST_DATABASE_URL = "sqlite://"


@pytest.fixture
def db_engine():
    """Fresh SQLite engine per test (StaticPool shares one in-memory connection)."""
    engine = create_engine(
        _TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture
def db_session(db_engine) -> Generator[Session, None, None]:
    """Database session bound to the per-test engine."""
    session = sessionmaker(autocommit=False, autoflush=False, bind=db_engine)()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture
def client(db_session: Session) -> Generator[TestClient, None, None]:
    """TestClient with get_db overridden to use SQLite session."""

    def _override_get_db() -> Generator[Session, None, None]:
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def seed_user(db_session):
    """Factory fixture to create a user with role and bcrypt password."""

    def _seed_user(
        *,
        email: str = "clinician@medscope.ai",
        password: str = "MedScope123!",
        role_name: str = "clinician",
        is_active: bool = True,
        first_name: str = "Test",
        last_name: str = "User",
    ):
        from models.role import Role
        from models.user import User
        from services.auth_service import AuthService

        role = db_session.scalar(select(Role).where(Role.name == role_name))
        if role is None:
            role = Role(name=role_name)
            db_session.add(role)
            db_session.flush()
        auth = AuthService(db_session)
        user = User(
            role_id=role.id,
            first_name=first_name,
            last_name=last_name,
            email=email,
            password_hash=auth.hash_password(password),
            is_active=is_active,
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        return user

    return _seed_user


@pytest.fixture
def login(client):
    """Factory fixture to POST /auth/login and return the response."""

    def _login(email: str, password: str = "MedScope123!"):
        return client.post(
            "/auth/login",
            json={"email": email, "password": password},
        )

    return _login


@pytest.fixture
def auth_header(login):
    """Factory fixture: login and return Authorization headers."""

    def _auth_header(email: str, password: str = "MedScope123!") -> dict[str, str]:
        response = login(email, password)
        assert response.status_code == 200
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}

    return _auth_header
