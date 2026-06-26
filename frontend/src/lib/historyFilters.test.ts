import { describe, expect, it } from "vitest";

import { buildAnalyticsDateRangeValue } from "@/lib/analyticsDateRange";
import {
  DEFAULT_HISTORY_FILTERS,
  hasActiveHistoryFilters,
  mergeEvaluatorOptions,
  resolveHistoryFilters,
} from "@/lib/historyFilters";
import type { HistoryUserSummary } from "@/types/history";

const evaluator: HistoryUserSummary = {
  id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  email: "clinician@medscope.ai",
  first_name: "Demo",
  last_name: "Clinician",
  role: "clinician",
};

describe("historyFilters", () => {
  it("resolves API params from filter state", () => {
    const params = resolveHistoryFilters({
      ...DEFAULT_HISTORY_FILTERS,
      dateRange: buildAnalyticsDateRangeValue("last_30"),
      risk_level: "high",
      user_id: evaluator.id,
    });

    expect(params.risk_level).toBe("high");
    expect(params.user_id).toBe(evaluator.id);
    expect(params.date_from).toBeTruthy();
    expect(params.date_to).toBeTruthy();
  });

  it("omits optional params when filters are set to all", () => {
    const params = resolveHistoryFilters({
      dateRange: { preset: "all" },
      risk_level: "all",
      user_id: "all",
    });

    expect(params).toEqual({});
  });

  it("detects active filters", () => {
    expect(hasActiveHistoryFilters(DEFAULT_HISTORY_FILTERS)).toBe(false);
    expect(
      hasActiveHistoryFilters({
        ...DEFAULT_HISTORY_FILTERS,
        risk_level: "medium",
      }),
    ).toBe(true);
  });

  it("merges unique evaluators sorted by name", () => {
    const otherEvaluator: HistoryUserSummary = {
      ...evaluator,
      id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      first_name: "Ana",
      last_name: "Analyst",
    };

    const result = mergeEvaluatorOptions([], [
      { user: evaluator },
      { user: evaluator },
      { user: otherEvaluator },
    ]);

    expect(result).toHaveLength(2);
    expect(result[0].first_name).toBe("Ana");
  });
});
