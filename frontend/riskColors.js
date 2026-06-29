/**
 * Clinical risk palette (RUX-011).
 * Light: design-system.light.md — Dark: design-system.dark.md (T-X03-02).
 * CSS mirrors: --color-risk-* in index.css
 */

export const RISK_COLORS_LIGHT = {
  low: "#16a34a",
  medium: "#f59e0b",
  high: "#dc2626",
};

export const RISK_COLORS_DARK = {
  low: "#4edea3",
  medium: "#fbbf24",
  high: "#ff6b6b",
};

/** Default palette (light MVP). Use getRiskColors() when theme-aware. */
export const RISK_COLORS = RISK_COLORS_LIGHT;

export const RISK_GAUGE_TRACK_COLOR_LIGHT = "#e7e8e9";
export const RISK_GAUGE_TRACK_COLOR_DARK = "#222a3d";

/** Gauge track — light default (surface-container-high). */
export const RISK_GAUGE_TRACK_COLOR = RISK_GAUGE_TRACK_COLOR_LIGHT;

/**
 * @param {"light" | "dark"} [theme]
 * @returns {typeof RISK_COLORS_LIGHT}
 */
export function getRiskColors(theme = "light") {
  return theme === "dark" ? RISK_COLORS_DARK : RISK_COLORS_LIGHT;
}

/**
 * @param {"light" | "dark"} [theme]
 * @returns {string}
 */
export function getRiskGaugeTrackColor(theme = "light") {
  return theme === "dark" ? RISK_GAUGE_TRACK_COLOR_DARK : RISK_GAUGE_TRACK_COLOR_LIGHT;
}
