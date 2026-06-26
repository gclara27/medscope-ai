import type { AnalyticsDatePreset, AnalyticsDateRangeValue, AnalyticsParams } from "@/types/analytics";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const ANALYTICS_DATE_PRESET_LABELS: Record<AnalyticsDatePreset, string> = {
  all: "All time",
  last_30: "Last 30 days",
  last_90: "Last 90 days",
  ytd: "Year to date",
  custom: "Custom range",
};

export function formatISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseISODate(value: string): Date | null {
  if (!ISO_DATE_PATTERN.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function buildAnalyticsDateRangeValue(
  preset: Exclude<AnalyticsDatePreset, "custom">,
  referenceDate = new Date(),
): AnalyticsDateRangeValue {
  const date_to = formatISODate(referenceDate);

  if (preset === "all") {
    return { preset };
  }

  if (preset === "ytd") {
    return {
      preset,
      date_from: formatISODate(new Date(referenceDate.getFullYear(), 0, 1)),
      date_to,
    };
  }

  const lookbackDays = preset === "last_30" ? 29 : 89;
  return {
    preset,
    date_from: formatISODate(addDays(referenceDate, -lookbackDays)),
    date_to,
  };
}

export const DEFAULT_ANALYTICS_DATE_RANGE: AnalyticsDateRangeValue = buildAnalyticsDateRangeValue(
  "last_30",
);

export function resolveAnalyticsDateRange(value: AnalyticsDateRangeValue): AnalyticsParams {
  if (value.preset === "all") {
    return {};
  }

  if (value.date_from && value.date_to) {
    return {
      date_from: value.date_from,
      date_to: value.date_to,
    };
  }

  return {};
}

export function validateAnalyticsDateRange(value: AnalyticsDateRangeValue): string | null {
  if (value.preset !== "custom") {
    return null;
  }

  if (!value.date_from || !value.date_to) {
    return "Select both start and end dates.";
  }

  const dateFrom = parseISODate(value.date_from);
  const dateTo = parseISODate(value.date_to);

  if (!dateFrom || !dateTo) {
    return "Enter valid dates in YYYY-MM-DD format.";
  }

  if (dateFrom > dateTo) {
    return "Start date must be on or before end date.";
  }

  return null;
}

export function getAnalyticsDateRangeLabel(value: AnalyticsDateRangeValue): string {
  if (value.preset !== "custom") {
    return ANALYTICS_DATE_PRESET_LABELS[value.preset];
  }

  if (value.date_from && value.date_to) {
    return `${value.date_from} to ${value.date_to}`;
  }

  return ANALYTICS_DATE_PRESET_LABELS.custom;
}
