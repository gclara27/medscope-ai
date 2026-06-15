"""Demo user seed data — Database.md §10."""

import uuid
from typing import TypedDict

from core.security import hash_password
from seeds.roles import SEED_ROLES

# Shared demo password for all seed accounts (TFM defense / local dev only).
DEMO_PASSWORD = "MedScope123!"


class UserSeed(TypedDict):
    id: uuid.UUID
    email: str
    first_name: str
    last_name: str
    role_name: str


SEED_USERS: list[UserSeed] = [
    {
        "id": uuid.UUID("b0000001-0000-4000-8000-000000000001"),
        "email": "admin@medscope.ai",
        "first_name": "Admin",
        "last_name": "MedScope",
        "role_name": "admin",
    },
    {
        "id": uuid.UUID("b0000002-0000-4000-8000-000000000002"),
        "email": "clinician@medscope.ai",
        "first_name": "Clara",
        "last_name": "Clinician",
        "role_name": "clinician",
    },
    {
        "id": uuid.UUID("b0000003-0000-4000-8000-000000000003"),
        "email": "analyst@medscope.ai",
        "first_name": "Alex",
        "last_name": "Analyst",
        "role_name": "analyst",
    },
    {
        "id": uuid.UUID("b0000004-0000-4000-8000-000000000004"),
        "email": "nurse@medscope.ai",
        "first_name": "Nina",
        "last_name": "Nurse",
        "role_name": "nurse",
    },
]

USER_EMAILS: tuple[str, ...] = tuple(user["email"] for user in SEED_USERS)

_ROLE_IDS = {role["name"]: role["id"] for role in SEED_ROLES}


def build_user_seed_rows() -> list[dict]:
    """Build user rows with bcrypt password hashes for Alembic bulk_insert."""
    password_hash = hash_password(DEMO_PASSWORD)
    return [
        {
            "id": user["id"],
            "role_id": _ROLE_IDS[user["role_name"]],
            "first_name": user["first_name"],
            "last_name": user["last_name"],
            "email": user["email"],
            "password_hash": password_hash,
            "is_active": True,
        }
        for user in SEED_USERS
    ]
