# T-X03-01 — Dark mode token audit

**Date:** 2026-06-11  
**Status:** Complete (audit only — no code changes)  
**Sources:** `design-system.light.md`, `design-system.dark.md`, `frontend/src/**`, `frontend/tailwind.config.js`, `frontend/riskColors.js`

---

## Executive summary

| Layer | Light-ready | Dark-ready | Action (T-X03 task) |
|---|---|---|---|
| `index.css` shadcn HSL vars (`:root`) | Yes | No `.dark` block | T-X03-02 |
| `tailwind.config.js` MedScope tokens | 22 hex literals | None | T-X03-03 |
| `riskColors.js` | Yes | No dark palette | T-X03-02 + T-X03-06 |
| `lib/recharts.ts` | Partial (`CHART_COLORS`) | Static light hex | T-X03-06 |
| Recharts components | Mixed (some use `CHART_COLORS`, some inline `#`) | — | T-X03-06 |
| Tailwind utility classes (`bg-surface-*`, `text-on-surface`) | Yes | Will follow CSS vars after T-X03-03 | T-X03-03 |
| `Toast.tsx` SVG icons | Hardcoded hex | — | T-X03-06 or token classes |
| `SimulationControlPanel` | `rgba(0,88,188,…)` = primary | — | T-X03-03 (`primary` var) |

**Default theme stays light.** Most UI already uses semantic Tailwind names (`bg-surface-container-lowest`, `text-on-surface-variant`) — once tokens are CSS variables, ~90% of screens need no per-component edits.

---

## Token matrix — light vs dark

Canonical YAML from design systems. **Proposed CSS variable names** for T-X03-02 (MedScope + shadcn mapping).

### Core surfaces & text

| CSS var (proposed) | Light (`design-system.light`) | Dark (`design-system.dark`) | Used in UI |
|---|---|---|---|
| `--color-background` | `#f8f9fa` | `#0b1326` | `bg-background`, `body` |
| `--color-surface` | `#f8f9fa` | `#0b1326` | `bg-surface` |
| `--color-surface-container` | `#edeeef` | `#171f33` | cards, panels |
| `--color-surface-container-low` | `#f3f4f5` | `#171f33` * | filters, subtle fills |
| `--color-surface-container-high` | `#e7e8e9` | `#222a3d` | gauge track, borders |
| `--color-surface-container-lowest` | `#ffffff` | `#171f33` * | elevated cards |
| `--color-on-surface` | `#191c1d` | `#dae2fd` | body text |
| `--color-on-surface-variant` | `#414755` | `#c1c6d7` | labels, meta |
| `--color-outline` | `#717786` | `#8b90a0` | icons, dividers |
| `--color-outline-variant` | `#c1c6d7` | `#414755` | borders |

\* Dark YAML has fewer elevation steps; map `surface-container-low` / `lowest` to `#171f33` or derive +4% lightness from `surface-container-high` if contrast fails in T-X03-07.

### Brand & actions

| CSS var (proposed) | Light | Dark | Used in UI |
|---|---|---|---|
| `--color-primary` | `#0058bc` | `#adc6ff` | buttons, links, focus |
| `--color-on-primary` | `#ffffff` | `#002e69` | text on primary fills |
| `--color-primary-container` | `#0070eb` | `#4b8eff` | strong accents |
| `--color-secondary` | `#4f6073` | `#7bd0ff` | SHAP “decreased risk” bars |
| `--color-tertiary` | `#005da7` | `#4edea3` | chart accent / success teal |
| `--color-error` | `#ba1a1a` | `#ffb4ab` | destructive, error toast |

### Risk (RUX-011)

| CSS var (proposed) | Light | Dark | Used in UI |
|---|---|---|---|
| `--color-risk-low` | `#16a34a` | `#4edea3` | badges, gauges, simulation |
| `--color-risk-medium` | `#f59e0b` | `#fbbf24` | badges, distribution |
| `--color-risk-high` | `#dc2626` | `#ffb4ab` | badges, SHAP increase |

### Chart-specific (not in dark YAML — derive for T-X03-06)

| Token | Light (current) | Dark (proposed) | Notes |
|---|---|---|---|
| `chart-grid` | `#e1e3e4` | `#222a3d` | = `surface-container-high` |
| `chart-axis` | `#414755` | `#c1c6d7` | = `on-surface-variant` |
| `chart-teal` | `#0d9488` | `#4edea3` | align with dark `tertiary` |
| `chart-muted` | `#8b9199` | `#8b90a0` | = dark `outline` |
| `tooltip-bg` | `#ffffff` | `#171f33` | Recharts `contentStyle` |
| `tooltip-border` | `#c1c6d7` | `#414755` | = dark `outline-variant` |

### shadcn semantic mapping (existing `index.css`)

| shadcn var | Light HSL (current) | Dark HSL (T-X03-02) |
|---|---|---|
| `--background` | `210 17% 98%` | map from `#0b1326` |
| `--foreground` | `192 9% 11%` | map from `#dae2fd` |
| `--card` | `0 0% 100%` | map from `#171f33` |
| `--primary` | `211 100% 37%` | map from `#adc6ff` |
| `--border` / `--input` | `225 16% 80%` | map from `#414755` |
| `--muted` | `210 11% 96%` | map from `#222a3d` |
| `--destructive` | `0 74% 42%` | map from `#ffb4ab` |

---

## Hardcoded hex inventory

### P0 — must fix for dark mode

| File | Line(s) | Hex / value | Maps to token |
|---|---|---|---|
| `frontend/tailwind.config.js` | 49–71 | 22 MedScope colors | All `--color-*` above |
| `frontend/tailwind.config.js` | 88 | `#0058bc` in `focus-glow` | `--color-primary` |
| `frontend/riskColors.js` | 6–8 | risk low/med/high | `--color-risk-*` |
| `frontend/riskColors.js` | 12 | `#e7e8e9` gauge track | `--color-surface-container-high` |
| `frontend/src/lib/recharts.ts` | 8–12 | primary, teal, muted, grid, axis | `CHART_COLORS` → theme hook |
| `frontend/src/components/charts/RiskDistributionChart.tsx` | 36–52 | grid, axis, tooltip border | Use `CHART_COLORS` (currently bypassed) |
| `frontend/src/components/analytics/AnalyticsTrendChart.tsx` | 50–71, 88 | `#c1c6d7`, `#0d9488` | `CHART_COLORS` + theme |
| `frontend/src/components/settings/ModelComparisonMetricChart.tsx` | 55–68 | `#c1c6d7` | `CHART_COLORS` |
| `frontend/src/components/Toast.tsx` | 21–68, 89 | success/error/info SVG + `border-[#16a34a40]` | risk + primary + semantic borders |
| `frontend/src/components/clinical/SimulationControlPanel.tsx` | 71–72 | `rgba(0,88,188,…)` | `primary` with opacity |

### P1 — config / meta (low user impact)

| File | Value | Notes |
|---|---|---|
| `frontend/index.html` | `theme-color` `#0058bc` | Optional: dynamic meta or dark `#adc6ff` |
| `frontend/tailwind.config.js` | safelist `border-[#16a34a40]` | Replace with `border-risk-low/25` after tokens |

### P2 — tests (assert light defaults; update in T-X03-08)

| File | Asserts |
|---|---|
| `frontend/src/lib/riskDisplay.test.ts` | `#16a34a`, `#f59e0b`, `#dc2626` |
| `frontend/src/lib/analyticsDisplay.test.ts` | `CHART_COLORS.*` light values |

### Already tokenized (no hex — will inherit `.dark`)

Components using only Tailwind semantic classes (sample; not exhaustive):

- Layout: `AppLayout`, `AppSidebar`, page shells
- Clinical: `ShapExplanationChart`, `SimulationImpactChart`, `ClinicalSection`, forms
- Dashboard / analytics cards: `DashboardKpiCards`, `AnalyticsKpiCards`
- Settings: `AuditLogsPanel`, `SystemConfigurationPanel`, `ModelComparisonPanel`
- Support: `SupportPage`, KB cards
- UI primitives: `card.tsx`, `button.tsx`, inputs via shadcn vars

---

## Inconsistencies found

1. **Dual token systems:** shadcn HSL vars in `index.css` vs hex literals in `tailwind.config.js` — dark mode requires unifying on CSS variables (T-X03-02 + T-X03-03).
2. **Recharts drift:** `AnalyticsTrendChart` / `ModelComparisonMetricChart` use `CHART_COLORS` for grid/axis but hardcode `#c1c6d7` for axis lines and tooltips; `RiskDistributionChart` hardcodes everything.
3. **Risk single source:** `riskColors.js` is shared by Tailwind and runtime — extend with `getRiskColors(theme)` or CSS vars instead of duplicating in `recharts.ts`.
4. **Dark secondary semantics:** light `secondary` (`#4f6073`) is muted gray-blue; dark `secondary` (`#7bd0ff`) is bright cyan — SHAP “decreased risk” will look intentionally different (acceptable per dark reference).
5. **Missing dark tokens:** light has `surface-container-lowest`, `error-container`, `secondary-container`, etc.; dark YAML is minimal — use proposed derivations in matrix above.

---

## Remediation map → T-X03 tasks

| Task | Scope from this audit |
|---|---|
| **T-X03-02** | Add `:root` + `.dark` CSS vars; extend `riskColors` or replace with `var(--color-risk-low)` |
| **T-X03-03** | Refactor `tailwind.config.js` to `var(--color-*)`; remove hex block lines 49–71 |
| **T-X03-04** | `ThemeProvider` — no token changes |
| **T-X03-05** | Appearance panel — no token changes |
| **T-X03-06** | `getChartColors(theme)`; fix 3 Recharts files + `Toast` SVG; `SimulationControlPanel` rgba |
| **T-X03-07** | Visual QA on P0 screens listed in TaskTracker |
| **T-X03-08** | Update tests for theme-aware risk/chart colors |

---

## P0 screens — token dependency check

| Screen | Hardcoded hex in component? | Relies on Tailwind tokens? |
|---|---|---|
| Login | No | Yes (`surface`, `primary`) |
| Dashboard | No (charts) | Yes + `RiskDistributionChart` **hex** |
| Evaluation / result | No | Yes + `ShapExplanationChart` tokens |
| Simulation | `SimulationControlPanel` rgba | Yes + impact chart tokens |
| History | No | Yes |
| Analytics | Chart **hex** partial | Yes |
| Settings | Chart **hex** partial | Yes |
| Support | No | Yes |
| Splash | Gradient `primary/5` | Yes (image overlay unchanged) |

---

## Sign-off

- [x] All `#hex` in `frontend/` grep reviewed (2026-06-11)
- [x] Light ↔ dark matrix aligned to `design-system.*.md`
- [x] Remediation mapped to T-X03-02 … T-X03-08
- [x] Implementation — T-X03-02 … T-X03-08 complete
- [x] P0 visual pass — [dark-mode-p0-pass.md](dark-mode-p0-pass.md)
