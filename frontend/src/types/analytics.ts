/** Analytics API types (aligned with backend/schemas/analytics.py). */

import type { RiskLevel } from "@/types/prediction";

/** Executive KPIs over filtered predictions (RF-062). */
export interface AnalyticsSummary {
  total_predictions: number;
  average_risk_percent: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  average_prediction_time_ms: number | null;
}

/** Population risk bucket for charts (UC-062). */
export interface RiskDistributionItem {
  risk_level: RiskLevel;
  count: number;
  percentage: number;
}

/** Daily prediction volume and average risk (UC-061). */
export interface TrendPoint {
  date: string;
  count: number;
  average_risk_percent: number;
}

/** Aggregated analytics payload (RF-060). */
export interface AnalyticsResponse {
  summary: AnalyticsSummary;
  risk_distribution: RiskDistributionItem[];
  trend: TrendPoint[];
  date_from: string | null;
  date_to: string | null;
}

/** Query params for GET /analytics (RF-061). */
export interface AnalyticsParams {
  date_from?: string;
  date_to?: string;
}

export type AnalyticsDatePreset = "all" | "last_30" | "last_90" | "ytd" | "custom";

/** UI state for analytics temporal filters (T-607, RF-061). */
export interface AnalyticsDateRangeValue {
  preset: AnalyticsDatePreset;
  date_from?: string;
  date_to?: string;
}
