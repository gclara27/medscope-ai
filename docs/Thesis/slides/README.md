# Slides TFM — carpeta de entrega

Coloca aquí la presentación final para el tribunal / Fundae.

## Archivos esperados

| Archivo | Descripción | Estado |
|---|---|---|
| `MedScope-AI-TFM.pptx` | PowerPoint 12 slides (generado) | ✅ En esta carpeta |
| `MedScope-AI-TFM.pdf` | PDF opcional como backup | Opcional |

## Regenerar el PPTX

```powershell
.\.venv\Scripts\pip.exe install python-pptx   # primera vez
.\.venv\Scripts\python.exe scripts\generate_thesis_pptx.py
```

Edita `[Tu nombre completo]` y `[Tu email / LinkedIn]` en la slide 1 y 12 (PowerPoint) o en `scripts/generate_thesis_pptx.py` antes de regenerar.

## Cómo crearlas (manual alternativa)

1. Sigue el contenido de [Slides-Presentacion-Video.md](../Slides-Presentacion-Video.md) (12 slides).
2. Imágenes: `docs/figures/screenshots/` + diagramas PNG de `docs/Architecture/`.
3. Guarda el `.pptx` en esta carpeta **o** publícalo en Google Slides y pon solo la URL en [README.md](../../README.md).

## URL pública (formulario Fundae)

Si usas Google Slides / Drive:

1. *Share* → *Anyone with the link* → *Viewer*
2. Copia la URL en `README.md` § TFM delivery y en [Entrega-TFM-Fundae.md](../Entrega-TFM-Fundae.md)

---

*Pendiente hasta que generes el archivo o la URL.*
