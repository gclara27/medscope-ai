"""Role permission defaults — RF-071, T-X02."""

from typing import TypedDict

PermissionModule = str

PERMISSION_MODULES: tuple[PermissionModule, ...] = (
    "dashboard",
    "evaluation",
    "simulation",
    "history",
    "analytics",
    "settings",
)

PERMISSION_LABELS: dict[PermissionModule, str] = {
    "dashboard": "Dashboard",
    "evaluation": "Clinical evaluation",
    "simulation": "Clinical simulation",
    "history": "Prediction history",
    "analytics": "Analytics",
    "settings": "System settings",
}


class RolePermissions(TypedDict):
    dashboard: bool
    evaluation: bool
    simulation: bool
    history: bool
    analytics: bool
    settings: bool


def _all_permissions(enabled: bool) -> RolePermissions:
    return RolePermissions(
        dashboard=enabled,
        evaluation=enabled,
        simulation=enabled,
        history=enabled,
        analytics=enabled,
        settings=enabled,
    )


DEFAULT_ROLE_PERMISSIONS: dict[str, RolePermissions] = {
    "admin": _all_permissions(True),
    "clinician": RolePermissions(
        dashboard=True,
        evaluation=True,
        simulation=True,
        history=True,
        analytics=False,
        settings=False,
    ),
    "analyst": RolePermissions(
        dashboard=True,
        evaluation=False,
        simulation=False,
        history=False,
        analytics=True,
        settings=False,
    ),
    "nurse": RolePermissions(
        dashboard=True,
        evaluation=False,
        simulation=False,
        history=True,
        analytics=False,
        settings=False,
    ),
}


def normalize_permissions(raw: dict | None, *, role_name: str) -> RolePermissions:
    """Merge stored permissions with defaults for unknown or missing roles."""
    defaults = DEFAULT_ROLE_PERMISSIONS.get(role_name, _all_permissions(False))
    if not raw:
        return defaults
    return RolePermissions(
        **{
            module: bool(raw.get(module, defaults[module]))  # type: ignore[literal-required]
            for module in PERMISSION_MODULES
        },
    )
