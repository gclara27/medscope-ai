"""EDA export tests (T-214)."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from ml.eda.constants import DEFAULT_EXPORT_DIR, EXPORT_SPECS
from ml.eda.figures import compute_missing_summary, export_all_eda_figures, load_eda_frame
from ml.preprocessing.constants import DEFAULT_RAW_DATA_PATH


def test_compute_missing_summary_flags_weight() -> None:
    if not DEFAULT_RAW_DATA_PATH.exists():
        pytest.skip("Raw dataset not downloaded")

    frame = load_eda_frame()
    missing = compute_missing_summary(frame)
    weight_row = missing.loc[missing["column"] == "weight"].iloc[0]
    assert float(weight_row["missing_pct"]) > 90


def test_export_all_eda_figures_writes_png_and_manifest(tmp_path: Path) -> None:
    if not DEFAULT_RAW_DATA_PATH.exists():
        pytest.skip("Raw dataset not downloaded")

    manifest = export_all_eda_figures(tmp_path, dpi=72)
    assert len(manifest["figures"]) == len(EXPORT_SPECS)

    for item in manifest["figures"]:
        png_path = tmp_path / item["file"]
        assert png_path.exists()
        assert png_path.stat().st_size > 0

    manifest_path = tmp_path / "manifest.json"
    payload = json.loads(manifest_path.read_text(encoding="utf-8"))
    assert payload["task"] == "T-214"
    assert payload["rows"] > 0


def test_default_export_dir_is_under_docs() -> None:
    assert DEFAULT_EXPORT_DIR.parts[-3:] == ("docs", "figures", "eda")
