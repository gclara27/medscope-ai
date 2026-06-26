"""System settings persistence — UC-071, T-X02."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from models.system_setting import SystemSetting
from seeds.system_settings import SYSTEM_SETTING_DEFAULTS


class SystemSettingsRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_settings(self) -> list[SystemSetting]:
        return list(self.db.scalars(select(SystemSetting).order_by(SystemSetting.key)).all())

    def get_by_key(self, key: str) -> SystemSetting | None:
        return self.db.get(SystemSetting, key)

    def ensure_defaults(self) -> None:
        """Insert missing default settings (idempotent for tests and fresh DBs)."""
        existing_keys = set(self.db.scalars(select(SystemSetting.key)).all())
        for seed in SYSTEM_SETTING_DEFAULTS:
            if seed["key"] in existing_keys:
                continue
            self.db.add(
                SystemSetting(
                    key=seed["key"],
                    value=seed["value"],
                    description=seed["description"],
                ),
            )
        self.db.commit()

    def upsert_values(self, values: dict[str, object]) -> list[SystemSetting]:
        updated: list[SystemSetting] = []
        for key, value in values.items():
            setting = self.get_by_key(key)
            if setting is None:
                seed = next((item for item in SYSTEM_SETTING_DEFAULTS if item["key"] == key), None)
                setting = SystemSetting(
                    key=key,
                    value=value,
                    description=seed["description"] if seed else None,
                )
                self.db.add(setting)
            else:
                setting.value = value
                self.db.add(setting)
            updated.append(setting)
        self.db.commit()
        for setting in updated:
            self.db.refresh(setting)
        return updated
