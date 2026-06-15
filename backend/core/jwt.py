"""JWT creation and validation — RF-003, UC-001, UC-080."""

import uuid
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta

from jose import JWTError, jwt

from core.config import settings
from models.user import User


@dataclass(frozen=True)
class TokenPayload:
    user_id: uuid.UUID
    email: str
    role: str


def create_access_token_for_user(user: User) -> tuple[str, int]:
    """Create a signed JWT and return (token, expires_in_seconds)."""
    expires_in = settings.jwt_expire_minutes * 60
    expire = datetime.now(UTC) + timedelta(seconds=expires_in)
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role.name,
        "exp": expire,
    }
    token = jwt.encode(
        payload,
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )
    return token, expires_in


def decode_access_token(token: str) -> TokenPayload:
    """Decode and validate a JWT access token."""
    payload = jwt.decode(
        token,
        settings.jwt_secret,
        algorithms=[settings.jwt_algorithm],
    )
    return TokenPayload(
        user_id=uuid.UUID(payload["sub"]),
        email=payload["email"],
        role=payload["role"],
    )


def is_token_error(exc: Exception) -> bool:
    """Return True if the exception indicates an invalid JWT."""
    return isinstance(exc, (JWTError, ValueError, KeyError))
