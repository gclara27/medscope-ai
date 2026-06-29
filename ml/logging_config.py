"""Structured logging for MedScope AI (RNF-050, RNF-051, T-711).

Shared by backend API and ML CLI scripts. Format: key=value lines or JSON.
"""

from __future__ import annotations

import json
import logging
import os
import sys
from datetime import UTC, datetime
from typing import Any

_STD_LOG_RECORD_KEYS = frozenset(
    {
        "name",
        "msg",
        "args",
        "levelname",
        "levelno",
        "pathname",
        "filename",
        "module",
        "exc_info",
        "exc_text",
        "stack_info",
        "lineno",
        "funcName",
        "created",
        "msecs",
        "relativeCreated",
        "thread",
        "threadName",
        "processName",
        "process",
        "message",
        "taskName",
    },
)


class StructuredLogFormatter(logging.Formatter):
    """Emit one-line structured logs (text key=value or JSON)."""

    def __init__(self, service: str, *, use_json: bool = False) -> None:
        super().__init__()
        self.service = service
        self.use_json = use_json

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": datetime.fromtimestamp(record.created, tz=UTC).isoformat(),
            "level": record.levelname,
            "service": self.service,
            "logger": record.name,
            "message": record.getMessage(),
        }

        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)

        for key, value in record.__dict__.items():
            if key in _STD_LOG_RECORD_KEYS or key.startswith("_"):
                continue
            if value is not None:
                payload[key] = value

        if self.use_json:
            return json.dumps(payload, default=str, ensure_ascii=False)

        parts = [f"{key}={self._format_value(value)}" for key, value in payload.items()]
        return " ".join(parts)

    @staticmethod
    def _format_value(value: Any) -> str:
        text = str(value)
        if " " in text or "=" in text or '"' in text:
            escaped = text.replace("\\", "\\\\").replace('"', '\\"')
            return f'"{escaped}"'
        return text


def configure_logging(*, service: str = "medscope") -> None:
    """Configure root logger once (idempotent)."""
    level_name = os.getenv("LOG_LEVEL", "INFO").upper()
    level = getattr(logging, level_name, logging.INFO)
    use_json = os.getenv("LOG_FORMAT", "text").strip().lower() == "json"

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(StructuredLogFormatter(service=service, use_json=use_json))

    root = logging.getLogger()
    if getattr(root, "_medscope_logging_configured", False):
        return

    root.handlers.clear()
    root.setLevel(level)
    root.addHandler(handler)
    root._medscope_logging_configured = True  # type: ignore[attr-defined]

    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """Return a module logger (call configure_logging first in entrypoints)."""
    return logging.getLogger(name)
