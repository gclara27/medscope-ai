# EDA Figures — Thesis Defense (T-214, RAC-001)

Gráficos exportados desde `notebooks/diabetes130_eda.ipynb` para la memoria y la defensa del TFM.

## Regenerar

```bash
python ml/scripts/download_dataset.py   # si aún no existe data.csv
python ml/scripts/export_eda_figures.py
```

Opciones:

```bash
python ml/scripts/export_eda_figures.py --output-dir docs/figures/eda --dpi 200
```

## Figuras

| Archivo | Uso en memoria / defensa |
|---|---|
| `01_missing_values.png` | Calidad de datos — placeholders y missing |
| `02_target_distribution.png` | Desbalance de `readmitted` |
| `03_binary_target.png` | Target MVP `readmit_30d` |
| `04_numeric_distributions.png` | Distribuciones numéricas clave |
| `05_categorical_distributions.png` | Variables categóricas MVP |
| `06_correlation_heatmap.png` | Correlaciones y redundancia |
| `07_readmission_rate_by_age.png` | Tasa de readmisión por edad |
| `08_encounters_per_patient.png` | Justificación deduplicación T-203 |

Metadatos: [`manifest.json`](manifest.json)

## Trazabilidad

- Notebook fuente: [`notebooks/diabetes130_eda.ipynb`](../../notebooks/diabetes130_eda.ipynb)
- Pipeline ML: [`docs/ML/ML-Pipeline.md`](../ML/ML-Pipeline.md)
- Task: **T-214** · **RAC-001**
