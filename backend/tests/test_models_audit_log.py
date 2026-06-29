"""AuditLog model tests — T-X06-01."""

import uuid

from models.audit_log import AuditLog
from models.role import Role
from models.user import User
from services.auth_service import AuthService


def test_audit_log_persists_with_optional_user(db_session) -> None:
    role = Role(name="admin-audit", description="Admin")
    db_session.add(role)
    db_session.flush()

    auth = AuthService(db_session)
    user = User(
        role_id=role.id,
        first_name="Audit",
        last_name="Tester",
        email="audit-model@medscope.ai",
        password_hash=auth.hash_password("MedScope123!"),
        is_active=True,
    )
    db_session.add(user)
    db_session.flush()

    entity_id = uuid.uuid4()
    log = AuditLog(
        user_id=user.id,
        action_type="prediction.create",
        entity_type="prediction",
        entity_id=entity_id,
        action_details={"prediction_id": str(entity_id)},
    )
    db_session.add(log)
    db_session.commit()

    found = db_session.get(AuditLog, log.id)
    assert found is not None
    assert found.action_type == "prediction.create"
    assert found.entity_id == entity_id
    assert found.action_details == {"prediction_id": str(entity_id)}


def test_audit_log_allows_null_user_for_system_events(db_session) -> None:
    log = AuditLog(
        user_id=None,
        action_type="auth.login",
        entity_type="user",
        entity_id=None,
        action_details={"email": "anonymous@example.com"},
    )
    db_session.add(log)
    db_session.commit()

    found = db_session.get(AuditLog, log.id)
    assert found is not None
    assert found.user_id is None
