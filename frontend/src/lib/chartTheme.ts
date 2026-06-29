import type { CSSProperties } from "react";

/** Recharts / SVG palette resolved from CSS tokens (T-X03-06, RUX-011). */
export interface ChartColorPalette {
  low: string;
  medium: string;
  high: string;
  primary: string;
  teal: string;
  muted: string;
  grid: string;
  axis: string;
  outline: string;
  tooltipBg: string;
  tooltipBorder: string;
  gaugeTrack: string;
}

/** Static light palette — unit tests and SSR fallback. */
export const CHART_COLORS_LIGHT: ChartColorPalette = {
  low: "#16a34a",
  medium: "#f59e0b",
  high: "#dc2626",
  primary: "#0058bc",
  teal: "#0d9488",
  muted: "#8b9199",
  grid: "#e1e3e4",
  axis: "#414755",
  outline: "#c1c6d7",
  tooltipBg: "#ffffff",
  tooltipBorder: "#c1c6d7",
  gaugeTrack: "#e7e8e9",
};

/** Static dark palette — test reference aligned with design-system.dark.md. */
export const CHART_COLORS_DARK: ChartColorPalette = {
  low: "#4edea3",
  medium: "#fbbf24",
  high: "#ff6b6b",
  primary: "#adc6ff",
  teal: "#4edea3",
  muted: "#8b90a0",
  grid: "#222a3d",
  axis: "#c1c6d7",
  outline: "#414755",
  tooltipBg: "#171f33",
  tooltipBorder: "#414755",
  gaugeTrack: "#222a3d",
};

function readCssColor(variable: string, fallback: string): string {
  if (typeof document === "undefined") {
    return fallback;
  }

  const raw = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  if (!raw) {
    return fallback;
  }
  if (raw.startsWith("#")) {
    return raw;
  }

  const channels = raw.split(/\s+/).map(Number);
  if (channels.length === 3 && channels.every((value) => !Number.isNaN(value))) {
    return `rgb(${channels[0]}, ${channels[1]}, ${channels[2]})`;
  }

  return fallback;
}

/** Reads active theme tokens from `index.css` (follows `.dark` on `<html>`). */
export function getChartColors(): ChartColorPalette {
  const fallback = document.documentElement.classList.contains("dark")
    ? CHART_COLORS_DARK
    : CHART_COLORS_LIGHT;

  return {
    low: readCssColor("--color-risk-low", fallback.low),
    medium: readCssColor("--color-risk-medium", fallback.medium),
    high: readCssColor("--color-risk-high", fallback.high),
    primary: readCssColor("--color-primary", fallback.primary),
    teal: readCssColor("--color-chart-teal", fallback.teal),
    muted: readCssColor("--color-chart-muted", fallback.muted),
    grid: readCssColor("--color-chart-grid", fallback.grid),
    axis: readCssColor("--color-chart-axis", fallback.axis),
    outline: readCssColor("--color-chart-tooltip-border", fallback.outline),
    tooltipBg: readCssColor("--color-chart-tooltip-bg", fallback.tooltipBg),
    tooltipBorder: readCssColor("--color-chart-tooltip-border", fallback.tooltipBorder),
    gaugeTrack: readCssColor("--color-surface-container-high", fallback.gaugeTrack),
  };
}

export function getRechartsTooltipStyle(colors: ChartColorPalette): CSSProperties {
  return {
    borderRadius: "8px",
    border: `1px solid ${colors.tooltipBorder}`,
    backgroundColor: colors.tooltipBg,
    color: colors.axis,
    fontSize: "13px",
  };
}

export function getRechartsTooltipLabelStyle(colors: ChartColorPalette): CSSProperties {
  return {
    color: colors.axis,
    fontWeight: 600,
    marginBottom: 4,
  };
}

export function getRechartsTooltipItemStyle(colors: ChartColorPalette): CSSProperties {
  return {
    color: colors.axis,
  };
}

/** Subtle column highlight on bar hover — visible in light and dark. */
export function getBarHighlightFill(colors: ChartColorPalette): string {
  if (colors.primary.startsWith("rgb(")) {
    return colors.primary.replace(/^rgb\(/, "rgba(").replace(/\)$/, ", 0.14)");
  }

  return document.documentElement.classList.contains("dark")
    ? "rgba(173, 198, 255, 0.14)"
    : "rgba(0, 88, 188, 0.08)";
}

export function getRechartsLegendStyle(colors: ChartColorPalette): CSSProperties {
  return {
    color: colors.axis,
    fontSize: "13px",
  };
}
