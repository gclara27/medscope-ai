"""Support routes — RF-073, UC-064–065, T-X05."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.database import get_db
from core.deps import get_current_user
from models.user import User
from schemas.support import SupportContactResponse
from services.system_settings_service import SystemSettingsService

router = APIRouter(prefix="/support", tags=["support"])


@router.get(
    "/contact",
    response_model=SupportContactResponse,
    summary="Get support contact email",
)
def get_support_contact(
    _user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SupportContactResponse:
    """Return configured support email for all authenticated users (RF-073)."""
    email = SystemSettingsService(db).get_support_contact_email()
    return SupportContactResponse(support_contact_email=email)
