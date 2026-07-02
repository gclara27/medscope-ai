"""Seed data stability — T-901, Database.md §10."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from core.security import verify_password
from models.role import Role
from models.user import User
from seeds.roles import ROLE_NAMES, SEED_ROLES
from seeds.users import DEMO_PASSWORD, SEED_USERS, USER_EMAILS, build_user_seed_rows


def test_seed_roles_catalog() -> None:
    assert ROLE_NAMES == ("admin", "clinician", "analyst", "nurse")
    assert len(SEED_ROLES) == 4
    assert {role["name"] for role in SEED_ROLES} == set(ROLE_NAMES)


def test_seed_users_catalog() -> None:
    assert len(SEED_USERS) == 4
    assert USER_EMAILS == (
        "admin@medscope.ai",
        "clinician@medscope.ai",
        "analyst@medscope.ai",
        "nurse@medscope.ai",
    )
    assert {user["role_name"] for user in SEED_USERS} == set(ROLE_NAMES)


def test_seed_ids_are_stable() -> None:
    """Migration seeds must keep fixed UUIDs for reproducible demo data."""
    role_ids = {role["id"] for role in SEED_ROLES}
    user_ids = {user["id"] for user in SEED_USERS}
    assert len(role_ids) == 4
    assert len(user_ids) == 4
    assert role_ids.isdisjoint(user_ids)


def test_build_user_seed_rows_hashes_demo_password() -> None:
    rows = build_user_seed_rows()

    assert len(rows) == len(SEED_USERS)
    assert {row["email"] for row in rows} == set(USER_EMAILS)
    assert all(row["is_active"] is True for row in rows)
    assert all(row["password_hash"] != DEMO_PASSWORD for row in rows)
    assert len({row["password_hash"] for row in rows}) == 1
    assert all(verify_password(DEMO_PASSWORD, row["password_hash"]) for row in rows)


def test_build_user_seed_rows_maps_roles() -> None:
    rows = build_user_seed_rows()
    role_by_id = {role["id"]: role["name"] for role in SEED_ROLES}

    for row, seed in zip(rows, SEED_USERS, strict=True):
        assert row["id"] == seed["id"]
        assert row["email"] == seed["email"]
        assert role_by_id[row["role_id"]] == seed["role_name"]


@pytest.fixture
def migrated_demo_db(db_session: Session) -> None:
    """Simulate Alembic role + user seed migrations on a fresh database."""
    for role in SEED_ROLES:
        db_session.add(
            Role(
                id=role["id"],
                name=role["name"],
                description=role["description"],
            ),
        )
    db_session.flush()

    for row in build_user_seed_rows():
        db_session.add(User(**row))

    db_session.commit()


@pytest.mark.parametrize(
    ("role_name", "email"),
    [
        ("admin", "admin@medscope.ai"),
        ("clinician", "clinician@medscope.ai"),
        ("analyst", "analyst@medscope.ai"),
        ("nurse", "nurse@medscope.ai"),
    ],
)
def test_migrated_demo_users_login_with_shared_password(
    client: TestClient,
    login,
    migrated_demo_db: None,
    role_name: str,
    email: str,
) -> None:
    response = login(email, DEMO_PASSWORD)

    assert response.status_code == 200
    data = response.json()
    assert data["user"]["email"] == email
    assert data["user"]["role"] == role_name
    assert data["access_token"]
