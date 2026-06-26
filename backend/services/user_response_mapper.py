"""Map ORM users to API responses with effective permissions (T-X02)."""

from core.permissions import get_effective_permissions
from models.user import User
from schemas.auth import UserResponse


def to_user_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role.name,
        permissions=get_effective_permissions(user.role),
    )
