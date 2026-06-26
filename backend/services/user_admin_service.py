"""Admin user management — create, deactivate, assign roles (T-X01, UC-070)."""

from __future__ import annotations

import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.user import User
from repositories.user_repository import UserRepository
from schemas.admin_users import (
    AdminUserListResponse,
    AdminUserResponse,
    CreateAdminUserRequest,
    UpdateAdminUserRequest,
)
from services.auth_service import AuthService


def _to_admin_user_response(user: User) -> AdminUserResponse:
    return AdminUserResponse(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role.name,
        is_active=user.is_active,
        created_at=user.created_at,
    )


class UserAdminService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.users = UserRepository(db)
        self.auth = AuthService(db)

    def list_users(self) -> AdminUserListResponse:
        items = [_to_admin_user_response(user) for user in self.users.list_users()]
        return AdminUserListResponse(items=items, total=len(items))

    def create_user(self, request: CreateAdminUserRequest) -> AdminUserResponse:
        if self.users.get_by_email(request.email) is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email already exists",
            )

        role = self.users.get_role_by_name(request.role)
        if role is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=f"Unknown role: {request.role}",
            )

        user = self.users.create_user(
            email=request.email,
            password_hash=self.auth.hash_password(request.password),
            first_name=request.first_name,
            last_name=request.last_name,
            role_id=role.id,
        )
        return _to_admin_user_response(user)

    def update_user(
        self,
        user_id: uuid.UUID,
        request: UpdateAdminUserRequest,
        *,
        acting_user_id: uuid.UUID,
    ) -> AdminUserResponse:
        user = self.users.get_by_id(user_id)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        if request.is_active is False and user.id == acting_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot deactivate your own account",
            )

        next_role_name = request.role if request.role is not None else user.role.name
        next_is_active = request.is_active if request.is_active is not None else user.is_active

        if user.role.name == "admin" and (next_role_name != "admin" or not next_is_active):
            if self.users.count_active_admins(exclude_user_id=user.id) == 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="At least one active administrator is required",
                )

        if request.first_name is not None:
            user.first_name = request.first_name.strip()
        if request.last_name is not None:
            user.last_name = request.last_name.strip()
        if request.is_active is not None:
            user.is_active = request.is_active
        if request.role is not None and request.role != user.role.name:
            role = self.users.get_role_by_name(request.role)
            if role is None:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                    detail=f"Unknown role: {request.role}",
                )
            user.role_id = role.id

        updated = self.users.update_user(user)
        return _to_admin_user_response(updated)
