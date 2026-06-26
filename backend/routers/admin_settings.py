"""Admin settings routes — RF-071, UC-071, T-X02."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.database import get_db
from core.deps import get_ml_registry, require_permission
from core.ml_registry import MLRegistry
from models.user import User
from schemas.admin_settings import (
    RolePolicyListResponse,
    RolePolicyResponse,
    SystemSettingsResponse,
    UpdateRolePolicyRequest,
    UpdateSystemSettingsRequest,
)
from services.role_policy_service import RolePolicyService
from services.system_settings_service import SystemSettingsService

router = APIRouter()


@router.get(
    "/roles",
    response_model=RolePolicyListResponse,
    summary="List role permission policies",
)
def list_role_policies(
    _admin: User = Depends(require_permission("settings")),
    db: Session = Depends(get_db),
) -> RolePolicyListResponse:
    """Return module permissions per role for the settings UI (RF-071)."""
    return RolePolicyService(db).list_policies()


@router.patch(
    "/roles/{role_id}",
    response_model=RolePolicyResponse,
    summary="Update role permission policy",
)
def update_role_policy(
    role_id: uuid.UUID,
    body: UpdateRolePolicyRequest,
    _admin: User = Depends(require_permission("settings")),
    db: Session = Depends(get_db),
) -> RolePolicyResponse:
    """Modify module access for a non-admin role (RF-071)."""
    return RolePolicyService(db).update_policy(role_id, body)


@router.get(
    "/settings",
    response_model=SystemSettingsResponse,
    summary="Get platform configuration",
)
def get_system_settings(
    _admin: User = Depends(require_permission("settings")),
    db: Session = Depends(get_db),
    registry: MLRegistry = Depends(get_ml_registry),
) -> SystemSettingsResponse:
    """Return persisted platform settings and read-only model metadata (UC-071)."""
    return SystemSettingsService(db, registry).get_settings()


@router.patch(
    "/settings",
    response_model=SystemSettingsResponse,
    summary="Update platform configuration",
)
def update_system_settings(
    body: UpdateSystemSettingsRequest,
    _admin: User = Depends(require_permission("settings")),
    db: Session = Depends(get_db),
    registry: MLRegistry = Depends(get_ml_registry),
) -> SystemSettingsResponse:
    """Persist admin-editable platform settings (UC-071)."""
    return SystemSettingsService(db, registry).update_settings(body)
