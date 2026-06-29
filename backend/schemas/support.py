"""Support API schemas — T-X05, RF-073."""

from pydantic import BaseModel, Field


class SupportContactResponse(BaseModel):
    support_contact_email: str = Field(..., min_length=3, max_length=255)
