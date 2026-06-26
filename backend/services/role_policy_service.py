"""Role policy management — RF-071, T-X02."""

from __future__ import annotations

import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.role import Role
from repositories.role_policy_repository import RolePolicyRepository
from schemas.admin_settings import (
    RolePolicyListResponse,
    RolePolicyResponse,
    UpdateRolePolicyRequest,
)
from seeds.permissions import PERMISSION_MODULES, normalize_permissions


class RolePolicyService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.roles = RolePolicyRepository(db)

    def list_policies(self) -> RolePolicyListResponse:
        items = [
            self._to_response(role)
            for role in self.roles.list_roles()
        ]
        return RolePolicyListResponse(items=items)

    def update_policy(
        self,
        role_id: uuid.UUID,
        request: UpdateRolePolicyRequest,
    ) -> RolePolicyResponse:
        role = self.roles.get_by_id(role_id)
        if role is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role not found",
            )
        if role.name == "admin":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Administrator permissions cannot be modified",
            )

        current = normalize_permissions(role.permissions, role_name=role.name)
        updated = current.copy()
        for module in PERMISSION_MODULES:
            if module in request.permissions:
                updated[module] = bool(request.permissions[module])

        if not updated.get("dashboard", False):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Dashboard access is required for every role",
            )

        role = self.roles.update_permissions(role, dict(updated))
        return self._to_response(role)

    def _to_response(self, role: Role) -> RolePolicyResponse:
        return RolePolicyResponse(
            id=role.id,
            name=role.name,
            description=role.description,
            permissions=dict(normalize_permissions(role.permissions, role_name=role.name)),
            is_locked=role.name == "admin",
        )
