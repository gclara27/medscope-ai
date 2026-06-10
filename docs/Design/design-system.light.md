---
name: MedScope AI Clinical System (Light)
status: default-mvp
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#414755'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#717786'
  outline-variant: '#c1c6d7'
  surface-tint: '#005bc1'
  primary: '#0058bc'
  on-primary: '#ffffff'
  primary-container: '#0070eb'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#4f6073'
  on-secondary: '#ffffff'
  secondary-container: '#d2e4fb'
  on-secondary-container: '#556679'
  tertiary: '#005da7'
  on-tertiary: '#ffffff'
  tertiary-container: '#2976c7'
  on-tertiary-container: '#fdfcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  risk-low: '#16a34a'
  risk-medium: '#f59e0b'
  risk-high: '#dc2626'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#d2e4fb'
  secondary-fixed-dim: '#b7c8de'
  on-secondary-fixed: '#0b1d2d'
  on-secondary-fixed-variant: '#38485a'
  tertiary-fixed: '#d4e3ff'
  tertiary-fixed-dim: '#a4c9ff'
  on-tertiary-fixed: '#001c39'
  on-tertiary-fixed-variant: '#004883'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  mono-data:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

# MedScope AI — Light Design System (default)

> **MVP theme.** Use this file for all frontend implementation unless dark mode is explicitly requested.
> Aligns with Requirements RUX-010 (azul médico, gris, blanco, teal suave).

Implementation must use the **YAML tokens above** as the source of truth for Tailwind/CSS variables.

## Brand & Style

Modern corporate / minimalist aesthetic for clinical decision support. Prioritizes clarity, precision, and trust.

- **Clinical precision:** information density managed with whitespace and a 12-column grid.
- **Trustworthy authority:** restrained medical blue + muted navy text (`on-surface: #191c1d`).
- **Functional calm:** muted surfaces (`background: #f8f9fa`) and clear semantic signaling.

## Colors

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#0058bc` | Primary actions, active states, links |
| `primary-container` | `#0070eb` | Emphasized interactive surfaces |
| `secondary` | `#4f6073` | Secondary text, sidebar accents |
| `tertiary` | `#005da7` | Charts, comparison series |
| `background` | `#f8f9fa` | App background |
| `surface-container-lowest` | `#ffffff` | Cards, panels |
| `on-surface` | `#191c1d` | Primary text (muted navy) |
| `outline-variant` | `#c1c6d7` | Borders, dividers |

### Risk indicators (RUX-011)

Use **only** for clinical risk — never decoratively:

| Token | Usage |
|---|---|
| `risk-low` (`#16a34a`) | Low readmission risk |
| `risk-medium` (`#f59e0b`) | Medium risk |
| `risk-high` (`#dc2626`) | High risk |

## Typography

Font family: **Inter** (UI), **JetBrains Mono** (`mono-data` for scores and metrics).

- Headlines: semibold/bold with tight letter-spacing.
- Body: 45–75 characters per line for clinical text blocks.
- Labels: `label-md` with expanded tracking for section headers.

## Layout & Spacing

- 8px baseline grid (4px sub-grid for fine detail).
- 12-column fluid grid on desktop.
- Margins: 16px mobile, 40px desktop.
- Dashboard layout: sidebar + main content + optional detail pane.

## Elevation & Depth

| Level | Treatment |
|---|---|
| 0 | `background` (#f8f9fa) |
| 1 | White card, 1px `outline-variant` border, soft shadow |
| 2 | Popovers/dropdowns, stronger shadow |
| Focus | 2px `primary` ring — not heavy shadow |

## Shapes

| Element | Radius |
|---|---|
| Buttons, inputs | 8px (`DEFAULT`) |
| Cards, modals | 16px (`lg`) |
| Status badges | Pill (`full`) |

## Components

### Buttons
- **Primary:** `primary` background, `on-primary` text.
- **Secondary:** outline with `secondary` / `on-surface`.
- **Ghost:** text only for tertiary actions.

### Cards
- 1px `outline-variant` border.
- Card title uses `label-md`.

### Inputs
- Background `surface-container-low`, border `outline-variant`.
- Focus: `primary` border + ring.
- Labels always visible above field.

### Status badges
- Tinted background (10% opacity) + full-strength text + icon.

### Data visualization (Recharts)
- 2px line stroke.
- Primary series: `primary` / `tertiary`.
- Grid lines: dotted `outline-variant`.
- Risk gauge: `risk-low` / `risk-medium` / `risk-high` (RFW-021).

### SHAP bars (RFW-023)
- Horizontal bars, healthcare palette.
- Positive impact → risk warm tones; protective → cool/teal tones.

### Clinical alerts
- Tinted backgrounds for standard alerts.
- Solid `error` only for critical alerts.
