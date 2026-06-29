"""Structured logging for ML pipelines (RNF-051, T-711)."""

from __future__ import annotations

import logging

from ml.logging_config import StructuredLogFormatter, configure_logging


def test_ml_configure_logging_service_name() -> None:
    formatter = StructuredLogFormatter(service="medscope-ml")
    assert formatter.service == "medscope-ml"


def test_ml_logger_emits_structured_extra_fields() -> None:
    configure_logging(service="medscope-ml-test")
    logger = logging.getLogger("ml.tests")
    formatter = logging.getLogger().handlers[0].formatter
    assert isinstance(formatter, StructuredLogFormatter)

    record = logging.LogRecord(
        name="ml.tests",
        level=logging.ERROR,
        pathname=__file__,
        lineno=1,
        msg="training_failed",
        args=(),
        exc_info=None,
    )
    record.reason = "dataset_missing"

    output = formatter.format(record)
    assert "reason=dataset_missing" in output
