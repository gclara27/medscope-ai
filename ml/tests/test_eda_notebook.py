"""Notebook deliverables (T-202+)."""

from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
EDA_NOTEBOOK = REPO_ROOT / "notebooks" / "diabetes130_eda.ipynb"
EDA_README = REPO_ROOT / "notebooks" / "README.md"


def test_eda_notebook_exists() -> None:
    assert EDA_NOTEBOOK.exists(), "notebooks/diabetes130_eda.ipynb is missing"


def test_eda_notebook_has_expected_sections() -> None:
    import json

    notebook = json.loads(EDA_NOTEBOOK.read_text(encoding="utf-8"))
    source = "\n".join(
        "".join(cell.get("source", [])) for cell in notebook["cells"] if cell.get("cell_type") == "markdown"
    )

    assert "Exploratory Data Analysis" in source
    assert "readmit" in source.lower()
    assert "conclusiones" in source.lower()


def test_notebooks_readme_links_eda() -> None:
    content = EDA_README.read_text(encoding="utf-8")
    assert "diabetes130_eda.ipynb" in content
    assert "T-202" in content
