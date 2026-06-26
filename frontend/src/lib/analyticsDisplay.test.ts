import { describe, expect, it } from "vitest";

import {
  formatAverageRiskPercent,
  formatPredictionLatencyMs,
  formatRiskMix,
  formatTrendDateLabel,
  getDominantRiskLevel,
  getRiskDistributionTotal,
  mapAnalyticsRiskDistribution,
  mapAnalyticsTrendPoints,
} from "@/lib/analyticsDisplay";
import { CHART_COLORS } from "@/lib/recharts";
import type { AnalyticsSummary, RiskDistributionItem } from "@/types/analytics";

const demoSummary: AnalyticsSummary = {
  total_predictions: 12,
  average_risk_percent: 41.5,
  high_risk_count: 2,
  medium_risk_count: 5,
  low_risk_count: 5,
  average_prediction_time_ms: 78.2,
};

const demoResponseTrend = [
  { date: "2026-06-10", count: 4, average_risk_percent: 38.2 },
  { date: "2026-06-11", count: 8, average_risk_percent: 43.1 },
];

describe("analyticsDisplay", () => {
  it("formats average risk and latency", () => {
    expect(formatAverageRiskPercent(41.5)).toBe("41.5%");
    expect(formatPredictionLatencyMs(78.2)).toBe("78 ms");
    expect(formatPredictionLatencyMs(null)).toBe("—");
  });

  it("formats risk mix string", () => {
    expect(formatRiskMix(demoSummary)).toBe("5 low · 5 med · 2 high");
  });

  it("picks dominant risk bucket by count", () => {
    expect(getDominantRiskLevel(demoSummary)).toBe("medium");
    expect(
      getDominantRiskLevel({
        ...demoSummary,
        high_risk_count: 9,
        medium_risk_count: 2,
        low_risk_count: 1,
      }),
    ).toBe("high");
    expect(getDominantRiskLevel({ ...demoSummary, total_predictions: 0 })).toBeNull();
  });

  it("maps analytics risk distribution to chart data in low-medium-high order", () => {
    const items: RiskDistributionItem[] = [
      { risk_level: "high", count: 2, percentage: 16.6 },
      { risk_level: "low", count: 5, percentage: 41.7 },
      { risk_level: "medium", count: 5, percentage: 41.7 },
    ];

    expect(mapAnalyticsRiskDistribution(items)).toEqual([
      { level: "Low", count: 5, percentage: 41.7, fill: CHART_COLORS.low },
      { level: "Medium", count: 5, percentage: 41.7, fill: CHART_COLORS.medium },
      { level: "High", count: 2, percentage: 16.6, fill: CHART_COLORS.high },
    ]);
    expect(getRiskDistributionTotal(items)).toBe(12);
  });

  it("maps trend points to chart labels", () => {
    expect(formatTrendDateLabel("2026-06-11")).toMatch(/jun/i);
    expect(mapAnalyticsTrendPoints(demoResponseTrend)).toEqual([
      { label: expect.any(String), count: 4, averageRiskPercent: 38.2 },
      { label: expect.any(String), count: 8, averageRiskPercent: 43.1 },
    ]);
  });
});
