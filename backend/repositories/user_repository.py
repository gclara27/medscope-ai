"""User and role persistence (T-112+)."""

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from models.user import User


class UserRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, user_id: uuid.UUID) -> User | None:
        """Return a user by primary key with role loaded."""
        return self.db.scalar(
            select(User)
            .options(joinedload(User.role))
            .where(User.id == user_id)
        )

    def get_by_email(self, email: str) -> User | None:
        """Return an active-directory user by email (case-insensitive)."""
        normalized = email.strip().lower()
        return self.db.scalar(
            select(User)
            .options(joinedload(User.role))
            .where(User.email == normalized)
        )
