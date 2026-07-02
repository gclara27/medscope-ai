"""T-906 — demo stability script prerequisites."""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

import httpx

ROOT = Path(__file__).resolve().parents[2]
SCRIPT = ROOT / "scripts" / "verify_demo_stability.py"


def _load_stability_module():
    spec = importlib.util.spec_from_file_location("verify_demo_stability", SCRIPT)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def test_t906_health_check_flags_ml_not_ready() -> None:
    mod = _load_stability_module()
    failures: list[str] = []
    response = MagicMock()
    response.raise_for_status.return_value = None
    response.json.return_value = {"status": "ok", "ml_ready": False}
    client = MagicMock()
    client.get.return_value = response

    mod.check_health(client, "http://test", failures)
    assert any("ml_ready" in item for item in failures)


def test_t906_frontend_smoke_accepts_ok_pages() -> None:
    mod = _load_stability_module()
    failures: list[str] = []

    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, request=request)

    transport = httpx.MockTransport(handler)
    with patch.object(httpx, "Client", return_value=httpx.Client(transport=transport)):
        mod.check_frontend_smoke("http://frontend.test", failures)

    assert failures == []
