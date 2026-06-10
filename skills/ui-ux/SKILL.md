---
name: medscope-ui-ux
description: >-
  UI/UX design for MedScope AI. Use for healthcare dashboard styling, color
  system, layout, accessibility, and chart presentation.
---

# Skill — UI/UX Design

## Purpose

This skill governs visual consistency and healthcare UX.

## Project documentation

Consult before implementing:
- `docs/Design/README.md` — design index and theme priority
- `docs/Design/project-brief.md` — screen inventory and design scope
- `docs/Design/design-system.light.md` — **default** tokens and components (MVP)
- `docs/Design/design-system.dark.md` — dark theme (optional, post-MVP)
- `docs/Design/screens/README.md` — mockup catalog (RFW-* mapping)
- `docs/Design/screens/<screen>/` — mockup.png + reference.html per page
- `docs/Requirements/Requirements.md` — §6.5, §13 (RUX-*, RFW-*)
- `docs/MedScope AI General Description.md` — product tone and value

## Rules

1. Use YAML tokens from `design-system.light.md` — do not invent colors.
2. Check `screens/` for mockups before building a page.
3. Dark mode is out of MVP scope unless explicitly requested.

---

# Visual style

Calm, clinical, trustworthy, enterprise-grade healthcare SaaS (RUX-001).

---

# Color system (light — default)

From `design-system.light.md`:

| Role | Token | Hex |
|---|---|---|
| Primary | `primary` | `#0058bc` |
| Background | `background` | `#f8f9fa` |
| Card surface | `surface-container-lowest` | `#ffffff` |
| Text | `on-surface` | `#191c1d` |
| Border | `outline-variant` | `#c1c6d7` |

Risk indicators (RUX-011):
- low → `risk-low` (green)
- medium → `risk-medium` (amber)
- high → `risk-high` (red)

---

# Typography

- **Inter** for UI text
- **JetBrains Mono** (`mono-data`) for scores and metrics

---

# Layout

- 12-column grid, sidebar navigation (RF-012)
- 8px baseline spacing grid
- Cards, grids, generous whitespace, clear hierarchy

Avoid: clutter, flashy UI, gaming aesthetics, excessive shadows or animation.

---

# Key UI patterns

- KPI cards on dashboard (RF-011)
- gauge charts for risk score (RFW-021)
- horizontal SHAP bars (RFW-023)
- simulation comparison (original vs simulated score)
- loading, success, and error feedback (UC-101–103)
- splash screen per `screens/splash/` (RFW-010)

---

# Accessibility & UX

- adequate contrast (RUX-020)
- readable typography (RUX-021)
- responsive design (RNF-041)
- low cognitive load (RNF-042)
- fast feedback on user actions

---

# Charts

Keep simple; emphasize clinical insight over decoration.
Coordinate with `skills/frontend/SKILL.md` for Recharts implementation.
