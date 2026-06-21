"""Dataset manifest and documentation tests (T-201)."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[2]
MANIFEST_PATH = REPO_ROOT / "datasets" / "manifest.json"
README_PATH = REPO_ROOT / "datasets" / "README.md"
RAW_CSV_PATH = REPO_ROOT / "datasets" / "diabetes130" / "raw" / "data.csv"


def test_manifest_exists_and_has_required_fields() -> None:
    assert MANIFEST_PATH.exists(), "datasets/manifest.json is missing"
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))

    assert manifest["dataset_id"] == "diabetes130-us-hospitals"
    assert manifest["target_column"] == "readmitted"
    assert "download_url" in manifest["source"]
    assert manifest["files"]["raw_csv"]["rows"] == 101766
    assert len(manifest["columns"]) == 50


def test_readme_documents_dataset() -> None:
    content = README_PATH.read_text(encoding="utf-8")
    assert "Diabetes 130-US" in content
    assert "download_dataset.py" in content
    assert "readmitted" in content


@pytest.mark.skipif(not RAW_CSV_PATH.exists(), reason="Raw CSV not downloaded locally")
def test_raw_csv_matches_manifest_columns() -> None:
    import pandas as pd

    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    df = pd.read_csv(RAW_CSV_PATH, low_memory=False)

    assert len(df) == manifest["files"]["raw_csv"]["rows"]
    assert list(df.columns) == manifest["columns"]
    assert set(df["readmitted"].dropna().unique()) == {"<30", ">30", "NO"}
