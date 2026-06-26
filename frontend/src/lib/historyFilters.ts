import type { AnalyticsDateRangeValue } from "@/types/analytics";
import type { HistoryListParams } from "@/types/history";
import type { HistoryUserSummary } from "@/types/history";
import type { RiskLevel } from "@/types/prediction";

import {
  getAnalyticsDateRangeLabel,
  resolveAnalyticsDateRange,
} from "@/lib/analyticsDateRange";
import { formatEvaluatorName } from "@/lib/historyDisplay";
import { RISK_LABELS } from "@/lib/riskDisplay";

export type HistoryRiskFilter = RiskLevel | "all";

export interface HistoryFiltersValue {
  dateRange: AnalyticsDateRangeValue;
  risk_level: HistoryRiskFilter;
  user_id: string | "all";
}

export const DEFAULT_HISTORY_FILTERS: HistoryFiltersValue = {
  dateRange: { preset: "all" },
  risk_level: "all",
  user_id: "all",
};

export const HISTORY_RISK_FILTER_OPTIONS: { value: HistoryRiskFilter; label: string }[] = [
  { value: "all", label: "All risk levels" },
  { value: "low", label: RISK_LABELS.low },
  { value: "medium", label: RISK_LABELS.medium },
  { value: "high", label: RISK_LABELS.high },
];

export function resolveHistoryFilters(filters: HistoryFiltersValue): HistoryListParams {
  const params: HistoryListParams = {
    ...resolveAnalyticsDateRange(filters.dateRange),
  };

  if (filters.risk_level !== "all") {
    params.risk_level = filters.risk_level;
  }

  if (filters.user_id !== "all") {
    params.user_id = filters.user_id;
  }

  return params;
}

export function hasActiveHistoryFilters(filters: HistoryFiltersValue): boolean {
  if (
    filters.risk_level !== DEFAULT_HISTORY_FILTERS.risk_level ||
    filters.user_id !== DEFAULT_HISTORY_FILTERS.user_id
  ) {
    return true;
  }

  if (filters.dateRange.preset !== DEFAULT_HISTORY_FILTERS.dateRange.preset) {
    return true;
  }

  if (filters.dateRange.preset === "custom") {
    return Boolean(filters.dateRange.date_from || filters.dateRange.date_to);
  }

  return false;
}

export function getHistoryFiltersSummary(
  filters: HistoryFiltersValue,
  evaluators: HistoryUserSummary[] = [],
): string {
  const parts: string[] = [getAnalyticsDateRangeLabel(filters.dateRange)];

  if (filters.risk_level !== "all") {
    parts.push(RISK_LABELS[filters.risk_level]);
  }

  if (filters.user_id !== "all") {
    const evaluator = evaluators.find((user) => user.id === filters.user_id);
    parts.push(evaluator ? formatEvaluatorName(evaluator) : "Selected evaluator");
  }

  return parts.join(" · ");
}

export function mergeEvaluatorOptions(
  current: HistoryUserSummary[],
  items: { user: HistoryUserSummary }[],
): HistoryUserSummary[] {
  const byId = new Map(current.map((user) => [user.id, user]));

  for (const item of items) {
    byId.set(item.user.id, item.user);
  }

  return Array.from(byId.values()).sort((left, right) =>
    formatEvaluatorName(left).localeCompare(formatEvaluatorName(right)),
  );
}
