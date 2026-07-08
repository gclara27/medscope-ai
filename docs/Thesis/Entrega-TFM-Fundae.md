# Entrega TFM — Requisitos Fundae (BIG School)

Checklist de cumplimiento según **Documentacion-TFM-Fundae-1.pdf** (fecha entrega temario: **20/07/2026**).

**Alumno:** Gastón Clara  
**Formulario:** cumplimentar en la lección del Proyecto Final del campus (añadir tu **email de inscripción BIG School**).

---

## Resumen ejecutivo

| Estado | Significado |
|---|---|
| ✅ | Cumplido |
| 🟡 | Acción manual pendiente (formulario, backup, ensayo) |

| # | Requisito Fundae | Estado | Dónde está |
|---|---|---|---|
| 1a | Descripción general | ✅ | [README.md](../../README.md) · [General Description](../MedScope%20AI%20General%20Description.md) |
| 1b | Stack tecnológico | ✅ | [README.md](../../README.md) |
| 1c | Instalación y ejecución | ✅ | [README.md](../../README.md) · `scripts/start-dev.ps1` |
| 1d | Estructura del proyecto | ✅ | [README.md](../../README.md) § Repository layout |
| 1e | Funcionalidades principales | ✅ | [README.md](../../README.md) § Main features |
| 1f | Usuario/contraseña prueba | ✅ | Ver § Credenciales |
| 2a | Repositorio GitHub público | ✅ | https://github.com/gclara27/medscope-ai |
| 2b | Repo privado + mouredev@gmail.com | — | No aplica (repo público) |
| 3 | Despliegue en funcionamiento | ✅ | [Deployment.md](../Deployment/Deployment.md) |
| 4 | Slides presentación + URL | ✅ | [Google Drive](https://drive.google.com/drive/folders/1LsHgjSsfbFv8gPR6sSTxAiHCUAMWvCng?usp=drive_link) · repo `slides/MedScope-AI-TFM.pptx` |
| 5a | Vídeo explicación + URL | ✅ | [Google Drive](https://drive.google.com/drive/folders/1LsHgjSsfbFv8gPR6sSTxAiHCUAMWvCng?usp=drive_link) (`PresentacionMedScopeAi2.mp4`) |
| 5b | Captura de pantalla en vídeo | ✅ | Confirmado en grabación |
| 5c | Rostro en cámara | ✅ | Opcional Fundae — incluido si aplica en el vídeo |
| — | Docs en el repo | ✅ | `docs/` |
| — | Info despliegue en repo | ✅ | `docs/Deployment/` |
| — | Slides en repo o enlace | ✅ | Repo + Drive |

---

## Datos para el formulario de entrega

Copiar y pegar en el campus (completar **email** con el de tu matrícula).

| Campo formulario | Valor |
|---|---|
| **Nombre completo** | Gastón Clara |
| **Email inscripción máster** | *(tu email BIG School — no almacenado en el repo)* |
| **URL repositorio GitHub** | https://github.com/gclara27/medscope-ai |
| **URL despliegue** | https://medscope-ai-delta.vercel.app |
| **URL slides** | https://drive.google.com/drive/folders/1LsHgjSsfbFv8gPR6sSTxAiHCUAMWvCng?usp=drive_link |
| **URL vídeo** | https://drive.google.com/drive/folders/1LsHgjSsfbFv8gPR6sSTxAiHCUAMWvCng?usp=drive_link |
| **Usuario prueba** | `clinician@medscope.ai` |
| **Contraseña prueba** | `MedScope123!` |

**Carpeta Drive (slides + vídeo):** [MedScopeAi](https://drive.google.com/drive/folders/1LsHgjSsfbFv8gPR6sSTxAiHCUAMWvCng?usp=drive_link)

| Archivo en Drive | Nombre |
|---|---|
| Presentación | `MedScope-AI-TFM.pptx` |
| Vídeo defensa | `PresentacionMedScopeAi2.mp4` |

> Verifica que la carpeta Drive tenga permiso **“Cualquier persona con el enlace” → Lector** antes de enviar el formulario.

### URLs adicionales (útiles para evaluadores)

| Recurso | URL |
|---|---|
| API health | https://medscope-ai-q8tg.onrender.com/health |
| Demo pública (sin login) | https://medscope-ai-delta.vercel.app/demo |
| Swagger API | https://medscope-ai-q8tg.onrender.com/docs |

---

## Credenciales de prueba

Usuarios seed (contraseña común **`MedScope123!`**). Se mantienen como credenciales de **demostración académica** para la evaluación Fundae.

| Email | Rol | Uso recomendado en demo |
|---|---|---|
| `clinician@medscope.ai` | Clinician | Flujo clínico completo (evaluación, SHAP, simulación) |
| `admin@medscope.ai` | Admin | + Analytics, settings, usuarios |
| `analyst@medscope.ai` | Analyst | Solo analytics |
| `nurse@medscope.ai` | Nurse | Dashboard + historial |

---

## 1. Documentación README.md — detalle

Fundae exige un **README.md completo**. El repositorio cumple con la sección **TFM delivery** en la raíz.

| Sub-requisito | Ubicación |
|---|---|
| Descripción general | README § About MedScope AI |
| Stack | README cabecera + § Tech stack |
| Instalación | README § Quick start, § One-command dev |
| Estructura | README § Repository layout |
| Funcionalidades | README § Main features |
| Login demo | README § TFM delivery |

Documentación ampliada: `docs/` (requisitos, casos de uso, BD, testing, arquitectura). No se exige memoria Word aparte para Fundae; [Memoria-TFM.md](Memoria-TFM.md) es borrador técnico de apoyo.

---

## 2. Código fuente — GitHub

- **Repositorio:** https://github.com/gclara27/medscope-ai (público)
- **Ramas:** `main` y `develop` alineadas con el estado de entrega

---

## 3. Despliegue

| Componente | Proveedor | URL |
|---|---|---|
| Frontend | Vercel | https://medscope-ai-delta.vercel.app |
| Backend + ML | Render (Docker) | https://medscope-ai-q8tg.onrender.com |
| PostgreSQL | Supabase | *(gestionado — ver Deployment.md)* |

**Nota cold start:** abrir `/health` 2–3 min antes de que el evaluador pruebe la app.

---

## 4. Slides — estado

| Ítem | Estado |
|---|---|
| Contenido 12 diapositivas | ✅ [Slides-Presentacion-Video.md](Slides-Presentacion-Video.md) |
| Archivo en repo | ✅ [slides/MedScope-AI-TFM.pptx](slides/MedScope-AI-TFM.pptx) |
| URL pública Drive | ✅ [carpeta MedScopeAi](https://drive.google.com/drive/folders/1LsHgjSsfbFv8gPR6sSTxAiHCUAMWvCng?usp=drive_link) |

---

## 5. Vídeo — estado

| Ítem | Estado |
|---|---|
| Guion | ✅ [Guion-Video-Defensa.md](Guion-Video-Defensa.md) |
| Grabación con captura de pantalla | ✅ `PresentacionMedScopeAi2.mp4` |
| URL pública | ✅ [Google Drive](https://drive.google.com/drive/folders/1LsHgjSsfbFv8gPR6sSTxAiHCUAMWvCng?usp=drive_link) |

---

## Checklist final antes del 20/07/2026

- [x] README.md — URLs de slides y vídeo
- [x] Repositorio GitHub público
- [x] App en producción operativa (`/health` → `ml_ready: true`)
- [x] Slides en repo y en Drive
- [x] Vídeo grabado (captura de pantalla) y subido a Drive
- [x] Credenciales demo documentadas (sin rotación)
- [ ] Permiso Drive “cualquiera con el enlace” verificado
- [ ] Backup local (`.\scripts\backup-demo-media.ps1 --video <ruta-mp4>`)
- [ ] Formulario campus cumplimentado (nombre + email + URLs)
- [ ] Ensayo incógnito: login + predict en producción

---

## Trazabilidad

| Fuente | Documento |
|---|---|
| Fundae BIG School | `Documentacion-TFM-Fundae-1.pdf` |
| Fecha entrega temario | 20/07/2026 |
| Proyecto | MedScope AI TFM — Gastón Clara |

---

*Última revisión: julio 2026 — entrega Fundae cerrada salvo formulario y backup.*
