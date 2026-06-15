"""OpenAPI / Swagger exposure (RBE-002, T-105)."""

from fastapi.testclient import TestClient


def test_swagger_ui_available(client: TestClient) -> None:
    response = client.get("/docs")
    assert response.status_code == 200
    assert "swagger" in response.text.lower()


def test_redoc_available(client: TestClient) -> None:
    response = client.get("/redoc")
    assert response.status_code == 200


def test_openapi_json_schema(client: TestClient) -> None:
    response = client.get("/openapi.json")
    assert response.status_code == 200
    schema = response.json()
    assert schema["info"]["title"] == "MedScope AI"
    assert schema["info"]["version"] == "0.1.0"
    assert "/health" in schema["paths"]


def test_openapi_router_tags_on_operations(client: TestClient) -> None:
    """Router tags appear on operations once endpoints exist; /health uses system."""
    schema = client.get("/openapi.json").json()
    operation_tags: set[str] = set()
    for path_item in schema["paths"].values():
        for operation in path_item.values():
            operation_tags.update(operation.get("tags", []))
    assert "system" in operation_tags
    assert schema["openapi"].startswith("3.")
