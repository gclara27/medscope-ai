"""Admin user management routes (T-X01, RF-070, UC-070)."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.database import get_db
from core.deps import require_permission
from models.user import User
from schemas.admin_users import (
    AdminUserListResponse,
    AdminUserResponse,
    CreateAdminUserRequest,
    UpdateAdminUserRequest,
)
from services.user_admin_service import UserAdminService

router = APIRouter()


@router.get(
    "/users",
    response_model=AdminUserListResponse,
    summary="List platform users",
)
def list_users(
    _admin: User = Depends(require_permission("settings")),
    db: Session = Depends(get_db),
) -> AdminUserListResponse:
    """Return all users for the admin settings UI (UC-070)."""
    return UserAdminService(db).list_users()


@router.post(
    "/users",
    response_model=AdminUserResponse,
    status_code=201,
    summary="Create a platform user",
)
def create_user(
    body: CreateAdminUserRequest,
    _admin: User = Depends(require_permission("settings")),
    db: Session = Depends(get_db),
) -> AdminUserResponse:
    """Create a user with role and bcrypt password (RF-070)."""
    return UserAdminService(db).create_user(body)


@router.patch(
    "/users/{user_id}",
    response_model=AdminUserResponse,
    summary="Update a platform user",
)
def update_user(
    user_id: uuid.UUID,
    body: UpdateAdminUserRequest,
    admin: User = Depends(require_permission("settings")),
    db: Session = Depends(get_db),
) -> AdminUserResponse:
    """Deactivate users or change roles (UC-070)."""
    return UserAdminService(db).update_user(user_id, body, acting_user_id=admin.id)
