"""User and role persistence (T-112+)."""

import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from models.role import Role
from models.user import User


class UserRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, user_id: uuid.UUID) -> User | None:
        """Return a user by primary key with role loaded."""
        return self.db.scalar(select(User).options(joinedload(User.role)).where(User.id == user_id))

    def get_by_email(self, email: str) -> User | None:
        """Return a user by email (case-insensitive)."""
        normalized = email.strip().lower()
        return self.db.scalar(select(User).options(joinedload(User.role)).where(User.email == normalized))

    def list_users(self) -> list[User]:
        """Return all users ordered by creation date (admin UI)."""
        return list(
            self.db.scalars(
                select(User)
                .options(joinedload(User.role))
                .order_by(User.created_at.desc(), User.email.asc()),
            ).all(),
        )

    def count_active_admins(self, *, exclude_user_id: uuid.UUID | None = None) -> int:
        query = (
            select(func.count())
            .select_from(User)
            .join(Role)
            .where(User.is_active.is_(True), Role.name == "admin")
        )
        if exclude_user_id is not None:
            query = query.where(User.id != exclude_user_id)
        return int(self.db.scalar(query) or 0)

    def get_role_by_name(self, role_name: str) -> Role | None:
        return self.db.scalar(select(Role).where(Role.name == role_name))

    def create_user(
        self,
        *,
        email: str,
        password_hash: str,
        first_name: str,
        last_name: str,
        role_id: uuid.UUID,
    ) -> User:
        user = User(
            email=email.strip().lower(),
            password_hash=password_hash,
            first_name=first_name.strip(),
            last_name=last_name.strip(),
            role_id=role_id,
            is_active=True,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return self.get_by_id(user.id) or user

    def update_user(self, user: User) -> User:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return self.get_by_id(user.id) or user
