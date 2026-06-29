"""Structured logging configuration (T-711, RNF-050)."""

from __future__ import annotations

import logging

from core.logging_config import configure_logging
from ml.logging_config import StructuredLogFormatter


def test_configure_logging_uses_structured_formatter() -> None:
    configure_logging()

    root = logging.getLogger()
    assert root.handlers
    formatter = root.handlers[0].formatter
    assert isinstance(formatter, StructuredLogFormatter)
    assert formatter.service == "medscope-api"


def test_structured_formatter_text_output() -> None:
    formatter = StructuredLogFormatter(service="medscope-test", use_json=False)
    record = logging.LogRecord(
        name="tests.logging",
        level=logging.INFO,
        pathname=__file__,
        lineno=1,
        msg="hello",
        args=(),
        exc_info=None,
    )
    record.event = "unit_test"

    output = formatter.format(record)

    assert "level=INFO" in output
    assert 'service=medscope-test' in output
    assert "message=hello" in output
    assert "event=unit_test" in output


def test_structured_formatter_json_output() -> None:
    formatter = StructuredLogFormatter(service="medscope-test", use_json=True)
    record = logging.LogRecord(
        name="tests.logging",
        level=logging.WARNING,
        pathname=__file__,
        lineno=1,
        msg="warn",
        args=(),
        exc_info=None,
    )

    output = formatter.format(record)

    assert '"level": "WARNING"' in output
    assert '"service": "medscope-test"' in output
    assert '"message": "warn"' in output
