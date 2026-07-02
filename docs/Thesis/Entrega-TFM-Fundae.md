# Entrega TFM — Requisitos Fundae (BIG School)

Checklist de cumplimiento según **Documentacion-TFM-Fundae-1.pdf** (fecha entrega temario: **20/07/2026**).

**Formulario:** cumplimentar en la lección del Proyecto Final del campus.

---

## Resumen ejecutivo

| Estado | Significado |
|---|---|
| ✅ | Cumplido en el repositorio |
| 🟡 | Preparado pero falta acción tuya (URL, archivo, grabación) |
| ⚠️ | Verificar manualmente |

| # | Requisito Fundae | Estado | Dónde está |
|---|---|---|---|
| 1a | Descripción general | ✅ | [README.md](../../README.md) · [General Description](../MedScope%20AI%20General%20Description.md) |
| 1b | Stack tecnológico | ✅ | [README.md](../../README.md) |
| 1c | Instalación y ejecución | ✅ | [README.md](../../README.md) · `scripts/start-dev.ps1` |
| 1d | Estructura del proyecto | ✅ | [README.md](../../README.md) § Repository layout |
| 1e | Funcionalidades principales | ✅ | [README.md](../../README.md) § Main features |
| 1f | Usuario/contraseña prueba | ✅ | Ver § Credenciales |
| 2a | Repositorio GitHub público | ⚠️ | `https://github.com/gclara27/medscope-ai` — confirmar visibilidad |
| 2b | Repo privado + mouredev@gmail.com | — | Solo si privado justificado |
| 3 | Despliegue en funcionamiento | ✅ | [Deployment.md](../Deployment/Deployment.md) |
| 4 | Slides presentación | 🟡 | `docs/Thesis/slides/MedScope-AI-TFM.pptx` generado — falta **URL pública** (Google Slides/Drive) para formulario |
| 5a | Vídeo explicación + URL | 🟡 | Guion listo; falta grabar y subir |
| 5b | Captura pantalla en vídeo | 🟡 | Obligatorio al grabar (ver guion) |
| 5c | Rostro en cámara | ✅ | Opcional — recomendado en nuestro guion |
| — | Docs en el repo | ✅ | `docs/` |
| — | Info despliegue en repo | ✅ | `docs/Deployment/` |
| — | Slides en repo o enlace | 🟡 | Añadir `slides/MedScope-AI-TFM.pptx` o URL en README |

---

## Datos para el formulario de entrega

Copiar cuando tengas las URLs finales. **Sustituir** los campos `PENDIENTE`.

| Campo formulario | Valor |
|---|---|
| **Nombre completo** | `[TU NOMBRE COMPLETO]` |
| **Email inscripción máster** | `[TU EMAIL BIG SCHOOL]` |
| **URL repositorio GitHub** | https://github.com/gclara27/medscope-ai |
| **URL despliegue** | https://medscope-ai-delta.vercel.app/login |
| **URL slides** | `PENDIENTE` — Google Slides / Drive público o enlace raw al `.pptx` en GitHub |
| **URL vídeo** | `PENDIENTE` — YouTube (no listado o público según normativa) / Google Drive |
| **Usuario prueba** | `clinician@medscope.ai` |
| **Contraseña prueba** | `MedScope123!` |

### URLs adicionales (útiles para evaluadores)

| Recurso | URL |
|---|---|
| API health | https://medscope-ai-q8tg.onrender.com/health |
| Demo pública (sin login) | https://medscope-ai-delta.vercel.app/demo |
| Swagger API | https://medscope-ai-q8tg.onrender.com/docs |

---

## Credenciales de prueba

Usuarios seed (contraseña común **`MedScope123!`**):

| Email | Rol | Uso recomendado en demo |
|---|---|---|
| `clinician@medscope.ai` | Clinician | Flujo clínico completo (evaluación, SHAP, simulación) |
| `admin@medscope.ai` | Admin | + Analytics, settings, usuarios |
| `analyst@medscope.ai` | Analyst | Solo analytics |
| `nurse@medscope.ai` | Nurse | Dashboard + historial |

**Antes de entregar:** si la URL es pública, **cambiar contraseñas** en producción o indicar en el formulario que son credenciales de demostración académica.

---

## 1. Documentación README.md — detalle

Fundae exige un **README.md completo**. El repositorio cumple con una sección dedicada **TFM delivery** en la raíz.

| Sub-requisito | Ubicación |
|---|---|
| Descripción general | README § About MedScope AI |
| Stack | README cabecera + § Tech stack |
| Instalación | README § Quick start, § One-command dev |
| Estructura | README § Repository layout |
| Funcionalidades | README § Main features |
| Login demo | README § Demo credentials |

Documentación ampliada: `docs/` (requisitos, casos de uso, BD, testing, arquitectura, memoria TFM).

---

## 2. Código fuente — GitHub

- **Repositorio:** https://github.com/gclara27/medscope-ai
- **Requisito:** repositorio **público** salvo justificación documentada.
- **Si es privado:** conceder acceso de lectura a **mouredev@gmail.com** y justificar en el formulario.

**Acción:** en GitHub → Settings → General → Danger zone / Change visibility → **Public** (recomendado para TFM).

---

## 3. Despliegue

✅ **Cumplido.** Aplicación accesible sin clonar el repo.

| Componente | Proveedor |
|---|---|
| Frontend | Vercel |
| Backend + ML | Render (Docker) |
| PostgreSQL | Supabase |

Guía: [Deployment.md](../Deployment/Deployment.md)  
**Nota cold start:** abrir `/health` 2–3 min antes de que el evaluador pruebe la app.

---

## 4. Slides — qué falta

**Contenido:** ✅ preparado en [Slides-Presentacion-Video.md](Slides-Presentacion-Video.md) (12 diapositivas).

**Acciones pendientes:**

1. Crear PowerPoint o Google Slides copiando el contenido del documento.
2. Exportar diagramas Mermaid a PNG ([System-Architecture](../Architecture/System-Architecture.md), [ML-Pipeline-Diagram](../Architecture/ML-Pipeline-Diagram.md)).
3. Insertar capturas de `docs/figures/screenshots/`.
4. **Opción A:** subir `MedScope-AI-TFM.pptx` a [`slides/`](slides/) en el repo.
5. **Opción B:** publicar en Google Slides → *Anyone with the link* → copiar URL.
6. Actualizar URL en [README.md](../../README.md) § TFM delivery y en este documento.

---

## 5. Vídeo — qué falta

**Guion:** ✅ [Guion-Video-Defensa.md](Guion-Video-Defensa.md) (~12 min, cámara + slides + pantalla).

**Requisitos Fundae del vídeo:**

| Requisito | Cómo cumplir |
|---|---|
| Tu explicación en voz | Grabar leyendo el guion (adaptar a tu estilo) |
| Captura de pantalla | **Obligatorio** — compartir app durante § demo (OBS, Zoom, etc.) |
| Rostro | Opcional — **recomendado** (ya previsto en guion PiP) |
| URL pública | Subir a YouTube / Google Drive / Vimeo y enlazar en README + formulario |

**Acciones pendientes:**

1. Ensayar 2 veces con cronómetro.
2. Calentar `https://medscope-ai-q8tg.onrender.com/health`.
3. Grabar (1080p MP4).
4. Subir y obtener URL.
5. Actualizar README § TFM delivery.

---

## Contenido extra del proyecto (más allá del mínimo Fundae)

Material que refuerza la entrega aunque no lo pida explícitamente el PDF:

| Material | Documento |
|---|---|
| Memoria borrador | [Memoria-TFM.md](Memoria-TFM.md) |
| Diagramas arquitectura | [Architecture/](../Architecture/README.md) |
| Capturas app | [figures/screenshots/](../figures/screenshots/README.md) |
| Gráficos EDA | [figures/eda/](../figures/eda/README.md) |
| Guion defensa presencial | [Argumentario-Defensa.md](Argumentario-Defensa.md) |
| Tests 215+ backend | [Testing.md](../Testing/Testing.md) |

---

## Checklist final antes del 20/07/2026

- [ ] README.md actualizado con URLs de slides y vídeo
- [ ] Repositorio GitHub **público** (o acceso mouredev@gmail.com)
- [ ] App en producción operativa (`/health` → `ml_ready: true`)
- [ ] Slides publicadas (URL o `.pptx` en repo)
- [ ] Vídeo grabado con **captura de pantalla** y subido (URL)
- [ ] Formulario campus cumplimentado
- [ ] Contraseñas demo revisadas para entrega pública
- [ ] Probar login + predict desde URL de producción en modo incógnito

---

## Trazabilidad

| Fuente | Documento |
|---|---|
| Fundae BIG School | `Documentacion-TFM-Fundae-1.pdf` |
| Fecha entrega temario | 20/07/2026 |
| Proyecto | MedScope AI TFM |

---

*Última revisión: julio 2026 — auditoría requisitos Fundae.*
