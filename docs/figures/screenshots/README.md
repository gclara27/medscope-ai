# Capturas de pantalla — memoria TFM (T-808)

Imágenes de la **aplicación en ejecución** para la memoria del TFM y la defensa (**RAC-001**, **RAC-010**).

**Mockups de diseño (referencia):** [Design/screens](../../Design/screens/README.md)  
**Regenerar capturas:** `.\scripts\capture-thesis-screenshots.ps1` (requiere stack dev o `PLAYWRIGHT_BASE_URL` en producción)

---

## Inventario MVP

| Archivo | Pantalla | UC / RFW | Rol captura |
|---|---|---|---|
| `01_splash.png` | Landing pública | RFW-010, UC-012 | — |
| `02_demo_case.png` | Demo guiado — caso paciente | RFW-027, UC-066 | — |
| `03_dashboard.png` | Dashboard clínico | RFW-012, UC-010 | admin |
| `04_evaluation_form.png` | Formulario evaluación | RFW-013, UC-020 | admin |
| `05_prediction_result_shap.png` | Resultado + gauge + SHAP | RFW-014–015, UC-023, UC-030 | admin |
| `06_simulation.png` | Simulación what-if | RFW-016, UC-040–044 | admin |
| `07_history.png` | Historial de predicciones | RFW-018, UC-050 | admin |
| `08_analytics.png` | Analytics poblacional | RFW-017, UC-060 | admin |

Captura con `admin@medscope.ai` para acceso a analytics en el mismo flujo. Para vistas solo clinician, cambiar usuario en `thesis-screenshots.spec.ts`.

---

## Cómo regenerar

### Local (recomendado)

```powershell
.\scripts\start-dev.ps1   # o .\dev.bat
.\scripts\capture-thesis-screenshots.ps1
```

### Producción (Vercel)

```powershell
$env:PLAYWRIGHT_BASE_URL = "https://medscope-ai-delta.vercel.app"
.\scripts\capture-thesis-screenshots.ps1
```

Requisitos: API Render activo (`ml_ready: true`), usuarios demo con contraseña `MedScope123!`. Calentar `/health` antes si hay cold start.

### Parámetros Playwright

- Viewport: **1440×900** (desktop)
- `fullPage: true`
- Test: `tests/e2e/thesis-screenshots.spec.ts`

---

## Uso en la memoria

| Capítulo sugerido | Capturas |
|---|---|
| Diseño e implementación UI | `03`–`08` |
| Explicabilidad (SHAP) | `05` |
| Simulación clínica | `06` |
| Demo pública / onboarding | `01`, `02` |
| Analytics y reporting | `08` |

**Privacidad:** datos sintéticos / demo; no incluir contraseñas ni tokens en figuras. Recortar barra de direcciones si la memoria lo exige.

---

## Backup defensa (T-905)

Empaqueta capturas, EDA, slides, memoria y (opcional) vídeo en `backups/` con checksums SHA-256:

```powershell
# Comprobar que todo el material está listo
.\scripts\backup-demo-media.ps1 --check-only

# Crear carpeta + .zip (copiar a USB / Drive)
.\scripts\backup-demo-media.ps1

# Incluir vídeo tras grabar
.\scripts\backup-demo-media.ps1 --video C:\Videos\medscope-demo.mp4

# O colocar un .mp4 en docs/Thesis/video/ y ejecutar sin --video
```

Verificar integridad: `python scripts/backup_demo_media.py --verify backups\medscope-ai-defensa-...`

---

## Trazabilidad

| Tarea | Entregable |
|---|---|
| T-808 | Este directorio + script Playwright |
| T-905 | Backup adicional — `scripts/backup-demo-media.ps1` (screenshots, EDA, slides, memoria, zip + SHA-256) |
| T-214 | [figures/eda](../eda/README.md) — gráficos ML |

---

*Generado con Playwright — T-808.*
