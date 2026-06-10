---
name: MedScope AI Clinical Intelligence (Dark)
status: optional-post-mvp
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c1c6d7'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#8b90a0'
  outline-variant: '#414755'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e69'
  primary-container: '#4b8eff'
  on-primary-container: '#00285c'
  inverse-primary: '#005bc1'
  secondary: '#7bd0ff'
  on-secondary: '#00354a'
  secondary-container: '#00a6e0'
  on-secondary-container: '#00374d'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#00a572'
  on-tertiary-container: '#00311f'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  risk-low: '#4edea3'
  risk-medium: '#fbbf24'
  risk-high: '#ffb4ab'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#c4e7ff'
  secondary-fixed-dim: '#7bd0ff'
  on-secondary-fixed: '#001e2c'
  on-secondary-fixed-variant: '#004c69'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  code-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  container-max: 1440px
---

# MedScope AI — Dark Design System (optional)

> **Post-MVP.** Dark mode is listed as optional in Requirements §18.
> Use only when explicitly requested. MVP implements `design-system.light.md`.

Reference mockups: `screens/splash/dark.png`, `screens/splash/dark-reference.html`.

## Brand & Style

Precision, authority, and reduced eye strain for long clinical sessions. Tonal layering on deep navy base — not pure black.

## Colors

| Token | Hex | Usage |
|---|---|---|
| `background` | `#0b1326` | App background |
| `surface-container` | `#171f33` | Cards, sidebar |
| `surface-container-high` | `#222a3d` | Elevated panels |
| `primary` | `#adc6ff` | Actions, AI highlights |
| `primary-container` | `#4b8eff` | Primary buttons |
| `on-surface` | `#dae2fd` | Primary text |
| `tertiary` | `#4edea3` | Success / healthy indicators |

Depth via **tonal elevation**, not heavy shadows. Borders: 1px `outline-variant`.

### Risk indicators (RUX-011)

| Token | Usage |
|---|---|
| `risk-low` (`#4edea3`) | Low risk |
| `risk-medium` (`#fbbf24`) | Medium risk |
| `risk-high` (`#ffb4ab`) | High risk |

## Typography

Inter only. Semibold headers (600). Expanded label tracking for legibility on dark surfaces.

## Layout & Spacing

- 12-column grid, max width 1440px.
- 4px spacing rhythm: 4, 8, 12, 16, 24, 32, 48, 64.
- Compact density for data tables; relaxed for diagnostic views.

## Components

- **Buttons:** `primary-container` fill; ghost secondary with `outline` border.
- **Inputs:** darker than parent surface; focus = 2px `primary` border.
- **AI insight card:** subtle `primary` → `secondary` gradient border to distinguish AI output.
- **Status chips:** low-saturation fill (10% opacity) + high-saturation text.

## Splash screen

See `screens/splash/dark-reference.html` for Tailwind token wiring reference.
Background asset: `screens/splash/background-corridor.png`.
