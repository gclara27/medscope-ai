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
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-data:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  lg: 1rem
  full: 9999px
spacing:
  unit: 4px
  md: 16px
  lg: 24px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

# MedScope AI — Light Design System (default)

> **MVP theme.** Map YAML tokens to Tailwind. Requirements: RUX-010, RUX-011.

## Brand & Style

Modern corporate / minimalist CDS platform. Clinical precision, trustworthy authority, functional calm.

## Colors (use YAML tokens)

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#0058bc` | Actions, links, focus |
| `background` | `#f8f9fa` | App background |
| `surface-container-lowest` | `#ffffff` | Cards |
| `on-surface` | `#191c1d` | Body text |
| `outline-variant` | `#c1c6d7` | Borders |

Risk (RUX-011): `risk-low` / `risk-medium` / `risk-high` — clinical risk only.

## Typography

Inter (UI), JetBrains Mono (`mono-data` for scores).

## Layout

12-column grid, 8px baseline, sidebar + main content. Margins: 16px mobile, 40px desktop.

## Components

Buttons (primary/secondary/ghost), bordered cards, labeled inputs, risk badges, Recharts with 2px strokes, horizontal SHAP bars, tinted clinical alerts.
