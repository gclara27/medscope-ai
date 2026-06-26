import type { AnalyticsSummary, RiskDistributionItem, TrendPoint } from "@/types/analytics";
import type { RiskLevel } from "@/types/prediction";

import type { RiskDistributionDatum } from "@/components/charts/RiskDistributionChart";
import { CHART_COLORS } from "@/lib/recharts";

const RISK_DISTRIBUTION_ORDER: RiskLevel[] = ["low", "medium", "high"];

const RISK_CHART_LABELS: Record<RiskLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export function mapAnalyticsRiskDistribution(
  items: RiskDistributionItem[],
): RiskDistributionDatum[] {
  const byLevel = new Map(items.map((item) => [item.risk_level, item]));

  return RISK_DISTRIBUTION_ORDER.map((level) => {
    const item = byLevel.get(level);
    return {
      level: RISK_CHART_LABELS[level],
      count: item?.count ?? 0,
      percentage: item?.percentage ?? 0,
      fill: CHART_COLORS[level],
    };
  });
}

export function getRiskDistributionTotal(items: RiskDistributionItem[]): number {
  return items.reduce((sum, item) => sum + item.count, 0);
}

export interface AnalyticsTrendDatum {
  label: string;
  count: number;
  averageRiskPercent: number;
}

export function formatTrendDateLabel(isoDate: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(`${isoDate}T00:00:00`));
}

export function mapAnalyticsTrendPoints(trend: TrendPoint[]): AnalyticsTrendDatum[] {
  return trend.map((point) => ({
    label: formatTrendDateLabel(point.date),
    count: point.count,
    averageRiskPercent: point.average_risk_percent,
  }));
}

export function formatAverageRiskPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatPredictionLatencyMs(value: number | null): string {
  if (value == null) {
    return "—";
  }
  return `${Math.round(value)} ms`;
}

export function formatRiskMix(summary: AnalyticsSummary): string {
  return `${summary.low_risk_count} low · ${summary.medium_risk_count} med · ${summary.high_risk_count} high`;
}

/** Highest non-zero risk bucket for KPI hint badges. */
export function getDominantRiskLevel(summary: AnalyticsSummary): RiskLevel | null {
  if (summary.total_predictions === 0) {
    return null;
  }

  const buckets: Array<{ level: RiskLevel; count: number }> = [
    { level: "high", count: summary.high_risk_count },
    { level: "medium", count: summary.medium_risk_count },
    { level: "low", count: summary.low_risk_count },
  ];

  return buckets.reduce((current, candidate) =>
    candidate.count > current.count ? candidate : current,
  ).level;
}
