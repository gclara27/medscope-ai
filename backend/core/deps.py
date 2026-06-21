"""FastAPI dependencies — authentication and authorization (T-122+)."""

from collections.abc import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from core.database import get_db
from core.jwt import decode_access_token, is_token_error
from core.ml_registry import MLRegistry, ml_registry
from models.user import User
from repositories.user_repository import UserRepository

_bearer_scheme = HTTPBearer(auto_error=False)

_CREDENTIALS_EXCEPTION = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Not authenticated",
    headers={"WWW-Authenticate": "Bearer"},
)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Validate Bearer JWT and return the active user (UC-080)."""
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise _CREDENTIALS_EXCEPTION
    try:
        token_data = decode_access_token(credentials.credentials)
    except Exception as exc:
        if is_token_error(exc):
            raise _CREDENTIALS_EXCEPTION from exc
        raise

    user = UserRepository(db).get_by_id(token_data.user_id)
    if user is None or not user.is_active:
        raise _CREDENTIALS_EXCEPTION
    return user


def require_roles(*allowed_roles: str) -> Callable[..., User]:
    """Dependency factory: authenticated user must have one of the allowed roles (UC-003)."""
    allowed = set(allowed_roles)

    def _require_role(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role.name not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user

    return _require_role


def get_ml_registry() -> MLRegistry:
    """Return the application-wide ML registry (loaded at startup)."""
    return ml_registry
