import { RISK_COLORS } from "../../riskColors.js";

/** Recharts theme tokens for MedScope dashboards (T-414, RFW-020, RUX-011). */
export const CHART_COLORS = {
  low: RISK_COLORS.low,
  medium: RISK_COLORS.medium,
  high: RISK_COLORS.high,
  primary: "#0058bc",
  grid: "#e1e3e4",
  axis: "#414755",
} as const;

export const DEFAULT_RISK_DISTRIBUTION = [
  { level: "Low", count: 12, fill: CHART_COLORS.low },
  { level: "Medium", count: 7, fill: CHART_COLORS.medium },
  { level: "High", count: 4, fill: CHART_COLORS.high },
] as const;
