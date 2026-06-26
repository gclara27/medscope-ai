"""Admin settings schemas — RF-071, UC-071, T-X02."""

from __future__ import annotations

import uuid
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from seeds.permissions import PERMISSION_MODULES


class RolePolicyResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    permissions: dict[str, bool]
    is_locked: bool = False


class RolePolicyListResponse(BaseModel):
    items: list[RolePolicyResponse]
    modules: list[str] = Field(default_factory=lambda: list(PERMISSION_MODULES))


class UpdateRolePolicyRequest(BaseModel):
    permissions: dict[str, bool]


class ModelMetadataResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    model_id: str | None = None
    model_version: str | None = None
    production_threshold: float | None = None
    ml_ready: bool = False


class SystemSettingsResponse(BaseModel):
    platform_name: str
    risk_threshold_high: float = Field(ge=0, le=1)
    risk_threshold_medium: float = Field(ge=0, le=1)
    support_contact_email: str
    model: ModelMetadataResponse


class UpdateSystemSettingsRequest(BaseModel):
    platform_name: str | None = Field(default=None, min_length=1, max_length=120)
    risk_threshold_high: float | None = Field(default=None, ge=0, le=1)
    risk_threshold_medium: float | None = Field(default=None, ge=0, le=1)
    support_contact_email: str | None = Field(default=None, min_length=3, max_length=255)
