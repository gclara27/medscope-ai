import { describe, expect, it } from "vitest";

import {
  formatAlertSummary,
  formatEvaluationReference,
  formatRelativeEvaluationTime,
} from "@/lib/dashboardActivityDisplay";

describe("dashboardActivityDisplay", () => {
  const now = new Date("2026-06-11T12:00:00Z").getTime();

  it("formats evaluation references and relative times", () => {
    expect(formatEvaluationReference("11111111-2222-3333-4444-555555555555")).toBe(
      "EV-11111111",
    );
    expect(formatRelativeEvaluationTime("2026-06-11T11:59:30Z", now)).toBe("Just now");
    expect(formatRelativeEvaluationTime("2026-06-11T11:45:00Z", now)).toBe("15m ago");
    expect(formatRelativeEvaluationTime("2026-06-11T09:00:00Z", now)).toBe("3h ago");
  });

  it("falls back to risk-based alert copy", () => {
    expect(formatAlertSummary(null, 88.4)).toMatch(/88\.4%/);
    expect(formatAlertSummary("Custom alert", 88.4)).toBe("Custom alert");
  });
});
