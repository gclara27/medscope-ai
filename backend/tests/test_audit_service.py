"""AuditService tests — T-X06-03."""

from __future__ import annotations

import uuid

import pytest
from fastapi import HTTPException

from repositories.audit_log_repository import AuditLogRepository
from services.audit_service import AUDIT_ACTION_TYPES, AuditService, sanitize_action_details


def test_sanitize_action_details_removes_phi_and_credentials() -> None:
    sanitized = sanitize_action_details(
        {
            "user_id": "123",
            "email": "clinician@medscope.ai",
            "password": "secret",
            "glucose": 120.5,
            "patient_input": {"age": 65},
            "nested": {"password_hash": "hash", "prediction_id": "abc"},
        },
    )

    assert sanitized == {
        "user_id": "123",
        "email": "clinician@medscope.ai",
        "nested": {"prediction_id": "abc"},
    }


def test_record_persists_sanitized_audit_log(db_session, seed_user) -> None:
    user = seed_user(email="audit-service@medscope.ai")
    service = AuditService(db_session)
    entity_id = uuid.uuid4()

    log = service.record(
        action_type="prediction.create",
        user_id=user.id,
        entity_type="prediction",
        entity_id=entity_id,
        action_details={
            "prediction_id": str(entity_id),
            "model_version": "v1",
            "glucose": 99.0,
        },
    )

    stored = AuditLogRepository(db_session).get_by_id(log.id)
    assert stored is not None
    assert stored.action_type == "prediction.create"
    assert stored.action_details == {
        "prediction_id": str(entity_id),
        "model_version": "v1",
    }


@pytest.mark.parametrize("action_type", sorted(AUDIT_ACTION_TYPES))
def test_record_accepts_v1_action_types(db_session, seed_user, action_type: str) -> None:
    user = seed_user(email=f"audit-{action_type}@medscope.ai")
    service = AuditService(db_session)

    log = service.record(
        action_type=action_type,
        user_id=user.id,
        action_details={"source": "test"},
    )

    assert log.action_type == action_type


def test_record_rejects_unknown_action_type(db_session, seed_user) -> None:
    user = seed_user(email="audit-invalid@medscope.ai")
    service = AuditService(db_session)

    with pytest.raises(HTTPException) as exc_info:
        service.record(action_type="unknown.action", user_id=user.id)

    assert exc_info.value.status_code == 500
    assert "Unsupported audit action_type" in str(exc_info.value.detail)


def test_record_safely_swallows_errors(db_session, seed_user) -> None:
    user = seed_user(email="audit-safe@medscope.ai")
    service = AuditService(db_session)

    service.record_safely(action_type="unknown.action", user_id=user.id)
