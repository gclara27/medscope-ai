"""Default system settings — UC-071, T-X02."""

from typing import Any, TypedDict


class SystemSettingSeed(TypedDict):
    key: str
    value: Any
    description: str


SYSTEM_SETTING_DEFAULTS: list[SystemSettingSeed] = [
    {
        "key": "platform_name",
        "value": "MedScope AI",
        "description": "Display name shown in the application shell",
    },
    {
        "key": "risk_threshold_high",
        "value": 0.5,
        "description": "Probability at or above which readmission risk is classified as high",
    },
    {
        "key": "risk_threshold_medium",
        "value": 0.35,
        "description": "Probability at or above which readmission risk is classified as medium",
    },
    {
        "key": "support_contact_email",
        "value": "support@medscope.ai",
        "description": "Contact email for platform support requests",
    },
]

SYSTEM_SETTING_KEYS: tuple[str, ...] = tuple(item["key"] for item in SYSTEM_SETTING_DEFAULTS)
