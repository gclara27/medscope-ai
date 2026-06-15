"""Authentication business logic — RNF-030, UC-001."""

from dataclasses import dataclass

from core.jwt import create_access_token_for_user
from core.security import hash_password, verify_password
from models.user import User
from repositories.user_repository import UserRepository
from sqlalchemy.orm import Session


@dataclass
class LoginResult:
    access_token: str
    token_type: str
    expires_in: int
    user: User


class AuthService:
    """Email/password authentication with bcrypt verification."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self.users = UserRepository(db)

    def hash_password(self, plain_password: str) -> str:
        """Hash a plain-text password for storage."""
        return hash_password(plain_password)

    def authenticate(self, email: str, password: str) -> User | None:
        """Validate credentials and return the user, or None if invalid/inactive."""
        user = self.users.get_by_email(email)
        if user is None or not user.is_active:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user

    def login(self, email: str, password: str) -> LoginResult | None:
        """Authenticate and issue a JWT access token."""
        user = self.authenticate(email, password)
        if user is None:
            return None
        access_token, expires_in = create_access_token_for_user(user)
        return LoginResult(
            access_token=access_token,
            token_type="bearer",
            expires_in=expires_in,
            user=user,
        )
