"""Support contact API tests — T-X05-04, RF-073."""

from __future__ import annotations

from fastapi.testclient import TestClient


def test_support_contact_requires_auth(client: TestClient) -> None:
    response = client.get("/support/contact")
    assert response.status_code == 401


def test_clinician_can_read_support_contact(
    client: TestClient,
    seed_user,
    auth_header,
) -> None:
    seed_user(email="clinician-support@medscope.ai", role_name="clinician")
    headers = auth_header("clinician-support@medscope.ai")

    response = client.get("/support/contact", headers=headers)

    assert response.status_code == 200
    assert response.json()["support_contact_email"] == "support@medscope.ai"


def test_nurse_can_read_support_contact(
    client: TestClient,
    seed_user,
    auth_header,
) -> None:
    seed_user(email="nurse-support@medscope.ai", role_name="nurse")
    headers = auth_header("nurse-support@medscope.ai")

    response = client.get("/support/contact", headers=headers)

    assert response.status_code == 200
    assert "@" in response.json()["support_contact_email"]
