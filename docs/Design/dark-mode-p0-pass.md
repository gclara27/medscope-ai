# T-X03-07 — Dark mode P0 visual pass

**Date:** 2026-06-11  
**Status:** Complete  
**Reference:** [design-system.dark.md](design-system.dark.md) · [dark-mode-token-audit.md](dark-mode-token-audit.md)

---

## Scope (P0 MVP screens)

| Screen | Route | Token audit | Dark fixes applied |
|---|---|---|---|
| Login | `/login` | Semantic (`bg-background`, `text-on-surface`) | Outer `bg-background`; meta `theme-color` |
| Splash | `/` | Semantic surfaces + gradient | Dark image overlay tuning |
| Dashboard | `/dashboard` | Cards, sidebar, KPIs | Shadow tokens via CSS vars |
| Evaluation | `/evaluation` | Forms, clinical sections | Inherited tokens |
| Result | `/evaluation/result` | Gauge, SHAP, badges | `useChartColors` gauge |
| Simulation | `/simulation` | Sliders, impact chart | Primary inset shadows → CSS var |
| History | `/history` | Table, filters, badges | Inherited tokens |
| Analytics | `/analytics` | KPIs, Recharts | Theme-aware charts + legend |
| Settings | `/settings` | Appearance + admin panels | Appearance panel (T-X03-05) |
| Support | `/support` | KB cards | Inherited tokens |

---

## Cross-cutting fixes (T-X03-07)

| Area | Change |
|---|---|
| Shadows | `--shadow-level-1/2` differ in `.dark` (deeper elevation on navy) |
| Focus glow | `--shadow-focus-glow` uses `rgb(var(--color-primary))` |
| Browser chrome | `ThemeProvider` sets `meta[name=theme-color]` light/dark |
| Recharts legend | `getRechartsLegendStyle()` — axis color in dark |
| Hardcoded hex | Removed from components (charts/Toast/simulation); only static refs in `chartTheme.ts` |

---

## SHAP / simulation

- `ShapExplanationChart` — `bg-risk-high`, `bg-secondary` (Tailwind tokens) ✓
- `SimulationImpactChart` — risk low/high opacity utilities ✓
- No component-level hex remaining in `frontend/src` (except test/chart fallbacks)

---

## Verification

- [x] Code review: no `bg-white` / `text-gray-*` in pages
- [x] Grep: no runtime `#hex` in `frontend/src` components
- [x] Vitest: `darkModeP0.test.tsx` (RTS-043 integration)
- [ ] Manual Phase-08 P0 — ejecutar en navegador antes de demo TFM

---

## Sign-off

P0 **code pass** complete. Manual checklist: [Phase-08-Dark-Mode.md](../Testing/Manual/Phase-08-Dark-Mode.md).
