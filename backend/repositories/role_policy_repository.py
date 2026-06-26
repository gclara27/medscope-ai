"""Role policy persistence — RF-071, T-X02."""

from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from models.role import Role


class RolePolicyRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_roles(self) -> list[Role]:
        return list(self.db.scalars(select(Role).order_by(Role.name)).all())

    def get_by_id(self, role_id: uuid.UUID) -> Role | None:
        return self.db.get(Role, role_id)

    def update_permissions(self, role: Role, permissions: dict[str, bool]) -> Role:
        role.permissions = permissions
        self.db.add(role)
        self.db.commit()
        self.db.refresh(role)
        return role
