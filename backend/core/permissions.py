"""Role permission resolution (RF-071, T-X02)."""

from models.role import Role
from seeds.permissions import normalize_permissions


def get_effective_permissions(role: Role) -> dict[str, bool]:
    """Return the effective permission map for a role."""
    return dict(normalize_permissions(role.permissions, role_name=role.name))
