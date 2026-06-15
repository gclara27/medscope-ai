"""Authentication routes — login, logout (T-121+)."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.database import get_db
from core.deps import get_current_user, require_roles
from models.user import User
from schemas.auth import LoginRequest, LoginResponse, LogoutResponse, UserResponse
from services.auth_service import AuthService

router = APIRouter()


def _to_user_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role.name,
    )


@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Authenticate with email and password",
)
def login(body: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    """Validate credentials and return a JWT access token (UC-001, RBE-013)."""
    result = AuthService(db).login(body.email, body.password)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    return LoginResponse(
        access_token=result.access_token,
        token_type=result.token_type,
        expires_in=result.expires_in,
        user=_to_user_response(result.user),
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current authenticated user",
)
def get_me(current_user: User = Depends(get_current_user)) -> UserResponse:
    """Return the user identified by the Bearer JWT (UC-080)."""
    return _to_user_response(current_user)


@router.post(
    "/logout",
    response_model=LogoutResponse,
    summary="End the current session",
)
def logout(_current_user: User = Depends(get_current_user)) -> LogoutResponse:
    """Acknowledge logout; client must discard the JWT (UC-002, RF-002)."""
    return LogoutResponse(
        message="Logged out successfully. Remove the access token on the client.",
    )


@router.get(
    "/admin/ping",
    summary="Admin-only health check for role authorization",
)
def admin_ping(
    current_user: User = Depends(require_roles("admin")),
) -> dict[str, str]:
    """Example route restricted to admin role (UC-003)."""
    return {"status": "ok", "role": current_user.role.name}
