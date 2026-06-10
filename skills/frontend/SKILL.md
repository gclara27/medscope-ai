---
name: medscope-frontend
description: >-
  React frontend for MedScope AI. Use for pages, components, routing, API
  services, forms, dashboards, and Recharts visualizations.
---

# Skill — Frontend Engineering

## Purpose

This skill governs React frontend implementation in `frontend/`.

## Project documentation

Consult before implementing:
- `docs/Design/design-system.light.md` — color/spacing tokens (map to Tailwind)
- `docs/Design/screens/` — screen mockups when available
- `docs/Requirements/Requirements.md` — §8 (frontend), §13 (UX/UI)
- `docs/Use Cases/Use Cases.md` — UC-010–012, UC-020–023, UC-100–103

---

# Stack

- React
- TypeScript
- TailwindCSS
- shadcn/ui
- Recharts
- React Router
- Axios

---

# Structure

```
frontend/src/
 ├── components/
 ├── pages/
 ├── services/      # API calls isolated here
 ├── hooks/
 ├── layouts/
 ├── store/
 ├── types/
 └── utils/
```

---

# Required screens

| Screen | Requirement |
|---|---|
| Splash | RFW-010 |
| Login | RFW-011 |
| Dashboard | RFW-012 |
| Prediction form | RFW-013 |
| Prediction result | RFW-014 |
| Explainability | RFW-015 |
| Simulation | RFW-016 |
| Analytics | RFW-017 |
| History | RFW-018 |

Sidebar (RF-012): dashboard, evaluation, simulation, history, analytics, settings.

---

# Rules

- use reusable components and TypeScript everywhere
- isolate API logic in `services/`
- keep pages modular and responsive (RNF-041)
- show loading, success, and error states (UC-101–103)
- validate forms client-side; backend is source of truth

Avoid: massive pages, inline styles, duplicated UI.

---

# Visualizations

Use Recharts for bar, line, donut, and trend charts.
Also support: gauge charts (RFW-021), risk indicators (RFW-022), SHAP bars (RFW-023).

---

# UI principles

Medical, enterprise, elegant, minimalistic.
Low cognitive load (RNF-042). Accessible contrast and readable typography (RUX-020–021).
