"""T-905 — thesis demo media backup prerequisites."""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SCRIPT = ROOT / "scripts" / "backup_demo_media.py"


def _load_backup_module():
    spec = importlib.util.spec_from_file_location("backup_demo_media", SCRIPT)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def test_t905_media_check_passes_without_video() -> None:
    mod = _load_backup_module()
    failures = mod.check_media(require_video=False, video_path=None)
    assert failures == [], failures


def test_t905_requires_video_when_flagged() -> None:
    mod = _load_backup_module()
    failures = mod.check_media(require_video=True, video_path=None)
    assert any("video" in item.lower() for item in failures)
