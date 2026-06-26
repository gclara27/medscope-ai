import { describe, expect, it } from "vitest";

import {
  buildAnalyticsDateRangeValue,
  DEFAULT_ANALYTICS_DATE_RANGE,
  formatISODate,
  getAnalyticsDateRangeLabel,
  resolveAnalyticsDateRange,
  validateAnalyticsDateRange,
} from "@/lib/analyticsDateRange";

const referenceDate = new Date(2026, 5, 11);

describe("analyticsDateRange", () => {
  it("builds preset ranges from a reference date", () => {
    expect(buildAnalyticsDateRangeValue("last_30", referenceDate)).toEqual({
      preset: "last_30",
      date_from: "2026-05-13",
      date_to: "2026-06-11",
    });
    expect(buildAnalyticsDateRangeValue("last_90", referenceDate)).toEqual({
      preset: "last_90",
      date_from: "2026-03-14",
      date_to: "2026-06-11",
    });
    expect(buildAnalyticsDateRangeValue("ytd", referenceDate)).toEqual({
      preset: "ytd",
      date_from: "2026-01-01",
      date_to: "2026-06-11",
    });
    expect(buildAnalyticsDateRangeValue("all", referenceDate)).toEqual({
      preset: "all",
    });
  });

  it("resolves API params from UI state", () => {
    expect(resolveAnalyticsDateRange(DEFAULT_ANALYTICS_DATE_RANGE)).toEqual({
      date_from: expect.any(String),
      date_to: expect.any(String),
    });
    expect(resolveAnalyticsDateRange({ preset: "all" })).toEqual({});
    expect(
      resolveAnalyticsDateRange({
        preset: "custom",
        date_from: "2026-06-01",
        date_to: "2026-06-30",
      }),
    ).toEqual({
      date_from: "2026-06-01",
      date_to: "2026-06-30",
    });
  });

  it("validates custom ranges", () => {
    expect(
      validateAnalyticsDateRange({
        preset: "custom",
        date_from: "2026-06-01",
        date_to: "2026-06-30",
      }),
    ).toBeNull();
    expect(
      validateAnalyticsDateRange({
        preset: "custom",
        date_from: "2026-06-30",
        date_to: "2026-06-01",
      }),
    ).toMatch(/on or before/i);
    expect(validateAnalyticsDateRange({ preset: "last_30", date_from: "2026-06-01" })).toBeNull();
  });

  it("formats labels and ISO dates", () => {
    expect(formatISODate(referenceDate)).toBe("2026-06-11");
    expect(getAnalyticsDateRangeLabel({ preset: "last_30", date_from: "2026-05-13", date_to: "2026-06-11" })).toBe(
      "Last 30 days",
    );
    expect(
      getAnalyticsDateRangeLabel({
        preset: "custom",
        date_from: "2026-06-01",
        date_to: "2026-06-30",
      }),
    ).toBe("2026-06-01 to 2026-06-30");
  });
});
