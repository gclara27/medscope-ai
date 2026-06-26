"""System settings management — UC-071, T-X02."""

from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from core.ml_registry import MLRegistry
from repositories.system_settings_repository import SystemSettingsRepository
from schemas.admin_settings import (
    ModelMetadataResponse,
    SystemSettingsResponse,
    UpdateSystemSettingsRequest,
)
from seeds.system_settings import SYSTEM_SETTING_KEYS


class SystemSettingsService:
    def __init__(self, db: Session, registry: MLRegistry | None = None) -> None:
        self.db = db
        self.settings = SystemSettingsRepository(db)
        self.registry = registry

    def get_settings(self) -> SystemSettingsResponse:
        self.settings.ensure_defaults()
        values = self._values_map()
        return SystemSettingsResponse(
            platform_name=str(values["platform_name"]),
            risk_threshold_high=float(values["risk_threshold_high"]),
            risk_threshold_medium=float(values["risk_threshold_medium"]),
            support_contact_email=str(values["support_contact_email"]),
            model=self._model_metadata(),
        )

    def update_settings(self, request: UpdateSystemSettingsRequest) -> SystemSettingsResponse:
        self.settings.ensure_defaults()
        updates: dict[str, object] = {}
        payload = request.model_dump(exclude_unset=True)
        for key in SYSTEM_SETTING_KEYS:
            if key in payload and payload[key] is not None:
                updates[key] = payload[key]

        if not updates:
            return self.get_settings()

        high = float(updates.get("risk_threshold_high", self._get_value("risk_threshold_high")))
        medium = float(
            updates.get("risk_threshold_medium", self._get_value("risk_threshold_medium")),
        )
        if medium >= high:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Medium risk threshold must be lower than the high risk threshold",
            )

        self.settings.upsert_values(updates)
        return self.get_settings()

    def get_risk_thresholds(self) -> tuple[float, float]:
        self.settings.ensure_defaults()
        return (
            float(self._get_value("risk_threshold_high")),
            float(self._get_value("risk_threshold_medium")),
        )

    def _values_map(self) -> dict[str, object]:
        self.settings.ensure_defaults()
        return {setting.key: setting.value for setting in self.settings.list_settings()}

    def _get_value(self, key: str) -> object:
        values = self._values_map()
        if key not in values:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Missing system setting: {key}",
            )
        return values[key]

    def _model_metadata(self) -> ModelMetadataResponse:
        if self.registry is None or not self.registry.is_ready or self.registry.manifest is None:
            return ModelMetadataResponse(ml_ready=False)
        manifest = self.registry.manifest
        return ModelMetadataResponse(
            model_id=str(manifest.get("model_id")) if manifest.get("model_id") else None,
            model_version=str(manifest.get("model_version"))
            if manifest.get("model_version")
            else None,
            production_threshold=float(manifest["production_threshold"])
            if manifest.get("production_threshold") is not None
            else None,
            ml_ready=True,
        )
