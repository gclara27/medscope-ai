"""MVP role seed data — RF-004, Database.md §4.1 / §10."""

import uuid
from typing import TypedDict


class RoleSeed(TypedDict):
    id: uuid.UUID
    name: str
    description: str


SEED_ROLES: list[RoleSeed] = [
    {
        "id": uuid.UUID("a0000001-0000-4000-8000-000000000001"),
        "name": "admin",
        "description": "System administrator with full access",
    },
    {
        "id": uuid.UUID("a0000002-0000-4000-8000-000000000002"),
        "name": "clinician",
        "description": "Clinical staff evaluating patients and running predictions",
    },
    {
        "id": uuid.UUID("a0000003-0000-4000-8000-000000000003"),
        "name": "analyst",
        "description": "Analytics and reporting access",
    },
    {
        "id": uuid.UUID("a0000004-0000-4000-8000-000000000004"),
        "name": "nurse",
        "description": "Nursing staff with read access to risk and history",
    },
]

ROLE_NAMES: tuple[str, ...] = tuple(role["name"] for role in SEED_ROLES)
