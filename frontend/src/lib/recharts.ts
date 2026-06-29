import { CHART_COLORS_LIGHT } from "@/lib/chartTheme";

/** Recharts theme tokens for MedScope dashboards (T-414, RFW-020, RUX-011). */
export const CHART_COLORS = CHART_COLORS_LIGHT;

export { CHART_COLORS_DARK, CHART_COLORS_LIGHT, getChartColors, getRechartsLegendStyle, getRechartsTooltipStyle } from "@/lib/chartTheme";
export type { ChartColorPalette } from "@/lib/chartTheme";

export const DEFAULT_RISK_DISTRIBUTION = [
  { level: "Low", count: 12, fill: CHART_COLORS.low },
  { level: "Medium", count: 7, fill: CHART_COLORS.medium },
  { level: "High", count: 4, fill: CHART_COLORS.high },
] as const;
