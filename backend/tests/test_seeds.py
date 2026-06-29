"""Seed data helpers — Database.md §10."""

from seeds.users import DEMO_PASSWORD, SEED_USERS, USER_EMAILS, build_user_seed_rows


def test_seed_users_catalog() -> None:
    assert len(SEED_USERS) == 4
    assert USER_EMAILS == (
        "admin@medscope.ai",
        "clinician@medscope.ai",
        "analyst@medscope.ai",
        "nurse@medscope.ai",
    )


def test_build_user_seed_rows_hashes_demo_password() -> None:
    rows = build_user_seed_rows()

    assert len(rows) == len(SEED_USERS)
    assert {row["email"] for row in rows} == set(USER_EMAILS)
    assert all(row["is_active"] is True for row in rows)
    assert all(row["password_hash"] != DEMO_PASSWORD for row in rows)
    assert len({row["password_hash"] for row in rows}) == 1
