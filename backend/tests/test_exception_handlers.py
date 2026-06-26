"""Global exception handler tests (T-311, UC-091, RNF-050)."""

from __future__ import annotations

import uuid

import pytest
from fastapi.exceptions import RequestValidationError
from fastapi.testclient import TestClient

from core.ml_registry import ml_registry

VALID_PREDICT_PAYLOAD = {
    "age": 65,
    "gender": "Female",
    "hospital_stay_days": 3,
    "medications_count": 8,
    "previous_admissions": 3,
    "glucose": 180,
    "blood_pressure": 120,
    "bmi": 28.4,
}


@pytest.fixture(scope="module", autouse=True)
def ensure_ml_loaded() -> None:
    if not ml_registry.is_ready:
        ml_registry.load()
    if not ml_registry.is_ready:
        pytest.skip(f"ML artifacts unavailable: {ml_registry.load_error}")


def test_validation_error_returns_json_detail_without_trace(
    client: TestClient,
    auth_header,
    seed_user,
) -> None:
    seed_user(email="clinician-errors@medscope.ai", role_name="clinician")
    headers = auth_header("clinician-errors@medscope.ai")

    response = client.post(
        "/predict",
        json={**VALID_PREDICT_PAYLOAD, "age": -1},
        headers=headers,
    )

    assert response.status_code == 422
    body = response.json()
    assert "detail" in body
    assert isinstance(body["detail"], list)
    assert "Traceback" not in response.text
    assert "RuntimeError" not in response.text


def test_http_exception_returns_json_detail(
    client: TestClient,
    auth_header,
    seed_user,
) -> None:
    seed_user(email="clinician-404@medscope.ai", role_name="clinician")
    headers = auth_header("clinician-404@medscope.ai")

    response = client.post(
        "/simulate",
        json={
            "prediction_id": str(uuid.uuid4()),
            "modifications": {"glucose": 120},
        },
        headers=headers,
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Prediction not found"}


def test_unhandled_exception_returns_safe_500(
    db_session,
    auth_header,
    seed_user,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    from collections.abc import Generator

    from core.database import get_db
    from main import app

    seed_user(email="clinician-500@medscope.ai", role_name="clinician")
    headers = auth_header("clinician-500@medscope.ai")

    def _boom(*_args, **_kwargs):
        raise RuntimeError("secret database password leaked")

    def _override_get_db() -> Generator:
        yield db_session

    monkeypatch.setattr(
        "services.prediction_service.PredictionService.predict",
        _boom,
    )

    app.dependency_overrides[get_db] = _override_get_db
    try:
        with TestClient(app, raise_server_exceptions=False) as isolated_client:
            response = isolated_client.post(
                "/predict",
                json=VALID_PREDICT_PAYLOAD,
                headers=headers,
            )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 500
    assert response.json() == {
        "detail": "An unexpected error occurred. Please try again later.",
    }
    assert "secret database password" not in response.text
    assert "Traceback" not in response.text
    assert "RuntimeError" not in response.text


def test_unauthenticated_returns_json_without_trace(client: TestClient) -> None:
    response = client.get("/history")

    assert response.status_code == 401
    body = response.json()
    assert body == {"detail": "Not authenticated"}
    assert "Traceback" not in response.text


def test_forbidden_returns_json_without_trace(
    client: TestClient,
    auth_header,
    seed_user,
) -> None:
    seed_user(email="clinician-forbidden@medscope.ai", role_name="clinician")
    headers = auth_header("clinician-forbidden@medscope.ai")

    response = client.get("/auth/admin/ping", headers=headers)

    assert response.status_code == 403
    body = response.json()
    assert body == {"detail": "Insufficient permissions"}
    assert "Traceback" not in response.text


@pytest.mark.asyncio
async def test_unhandled_handler_delegates_validation_errors() -> None:
    """Catch-all must not mask 422 if a validation error reaches ServerErrorMiddleware."""
    from starlette.requests import Request

    from core.api_errors import INTERNAL_SERVER_ERROR
    from core.exception_handlers import unhandled_exception_handler

    scope = {
        "type": "http",
        "method": "POST",
        "path": "/predict",
        "headers": [],
        "query_string": b"",
    }
    request = Request(scope)
    exc = RequestValidationError(
        [
            {
                "type": "greater_than_equal",
                "loc": ("body", "age"),
                "msg": "Input should be greater than or equal to 0",
                "input": -1,
            }
        ]
    )

    response = await unhandled_exception_handler(request, exc)

    assert response.status_code == 422
    assert response.body is not None
    assert b'"detail"' in response.body
    assert INTERNAL_SERVER_ERROR.encode() not in response.body
