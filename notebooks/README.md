# Notebooks — MedScope AI

Exploratory analysis and thesis figures (not production code).

| Notebook | Task | Description |
|---|---|---|
| [`diabetes130_eda.ipynb`](diabetes130_eda.ipynb) | T-202, T-214 | EDA — Diabetes 130-US hospitals dataset |

## Export figures for thesis (T-214)

```bash
python ml/scripts/export_eda_figures.py
```

Output: [`docs/figures/eda/`](../docs/figures/eda/README.md)

## Run locally

```bash
# From repo root, with venv active and dataset downloaded (T-201)
python ml/scripts/download_dataset.py
jupyter notebook notebooks/diabetes130_eda.ipynb
```

Or open the `.ipynb` in VS Code / Cursor with the Jupyter extension.
