"""Admin audit log response schemas — RF-075, RBE-016, T-X06."""

from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class AuditLogUserSummary(BaseModel):
    """User who performed the audited action."""

    id: UUID
    email: str
    first_name: str
    last_name: str
    role: str


class AuditLogListItem(BaseModel):
    """Single audit log row for admin review (UC-085)."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID | None = None
    action_type: str
    entity_type: str | None = None
    entity_id: UUID | None = None
    action_details: dict[str, Any] | None = None
    created_at: datetime
    user: AuditLogUserSummary | None = None


class AuditLogListResponse(BaseModel):
    """Paginated audit log listing (RF-075)."""

    items: list[AuditLogListItem]
    total: int
    page: int = Field(ge=1)
    page_size: int = Field(ge=1, le=100)
