"""AuditLogRepository tests — T-X06-02."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime, timedelta

from models.audit_log import AuditLog
from repositories.audit_log_repository import AuditLogRepository


def _create_log(
    repo: AuditLogRepository,
    *,
    action_type: str,
    user_id: uuid.UUID | None = None,
    created_at: datetime | None = None,
) -> AuditLog:
    log = repo.create(
        user_id=user_id,
        action_type=action_type,
        entity_type="prediction" if action_type == "prediction.create" else None,
        entity_id=uuid.uuid4() if action_type == "prediction.create" else None,
        action_details={"source": "test"},
    )
    if created_at is not None:
        log.created_at = created_at
        repo.db.add(log)
        repo.db.commit()
        repo.db.refresh(log)
    return log


def test_create_audit_log_persists_fields(db_session, seed_user) -> None:
    user = seed_user(email="audit-repo@medscope.ai")
    repo = AuditLogRepository(db_session)
    entity_id = uuid.uuid4()

    log = repo.create(
        user_id=user.id,
        action_type="prediction.create",
        entity_type="prediction",
        entity_id=entity_id,
        action_details={"prediction_id": str(entity_id)},
    )

    found = repo.get_by_id(log.id)
    assert found is not None
    assert found.action_type == "prediction.create"
    assert found.user_id == user.id
    assert found.entity_id == entity_id
    assert found.user is not None
    assert found.user.email == "audit-repo@medscope.ai"


def test_list_audit_logs_filters_by_action_type(db_session, seed_user) -> None:
    user = seed_user(email="audit-filter@medscope.ai")
    repo = AuditLogRepository(db_session)
    _create_log(repo, user_id=user.id, action_type="auth.login")
    _create_log(repo, user_id=user.id, action_type="prediction.create")
    _create_log(repo, user_id=user.id, action_type="prediction.create")

    rows, total = repo.list_audit_logs(action_type="prediction.create")
    assert total == 2
    assert len(rows) == 2
    assert all(row.action_type == "prediction.create" for row in rows)


def test_list_audit_logs_filters_by_user_id(db_session, seed_user) -> None:
    user_a = seed_user(email="audit-a@medscope.ai")
    user_b = seed_user(email="audit-b@medscope.ai")
    repo = AuditLogRepository(db_session)
    _create_log(repo, user_id=user_a.id, action_type="auth.login")
    _create_log(repo, user_id=user_b.id, action_type="auth.login")

    rows, total = repo.list_audit_logs(user_id=user_a.id)
    assert total == 1
    assert len(rows) == 1
    assert rows[0].user_id == user_a.id


def test_list_audit_logs_filters_by_date_range(db_session, seed_user) -> None:
    user = seed_user(email="audit-date@medscope.ai")
    repo = AuditLogRepository(db_session)
    today = datetime.now(UTC).date()
    yesterday = today - timedelta(days=1)
    tomorrow = today + timedelta(days=1)

    _create_log(
        repo,
        user_id=user.id,
        action_type="auth.login",
        created_at=datetime.combine(yesterday, datetime.min.time(), tzinfo=UTC),
    )
    _create_log(
        repo,
        user_id=user.id,
        action_type="auth.logout",
        created_at=datetime.combine(today, datetime.min.time(), tzinfo=UTC),
    )

    rows, total = repo.list_audit_logs(date_from=today, date_to=tomorrow)
    assert total == 1
    assert len(rows) == 1
    assert rows[0].action_type == "auth.logout"


def test_list_audit_logs_pagination(db_session, seed_user) -> None:
    user = seed_user(email="audit-page@medscope.ai")
    repo = AuditLogRepository(db_session)
    for index in range(3):
        _create_log(repo, user_id=user.id, action_type=f"auth.login.{index}")

    page_one, total = repo.list_audit_logs(limit=2, offset=0)
    page_two, _ = repo.list_audit_logs(limit=2, offset=2)

    assert total == 3
    assert len(page_one) == 2
    assert len(page_two) == 1
    assert page_one[0].created_at >= page_one[1].created_at
