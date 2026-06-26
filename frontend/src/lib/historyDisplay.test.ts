import { describe, expect, it } from "vitest";

import {
  formatEvaluatorName,
  formatHistoryRangeLabel,
  formatPatientSnapshot,
} from "@/lib/historyDisplay";

describe("historyDisplay", () => {
  it("formats evaluator display name", () => {
    expect(
      formatEvaluatorName({
        id: "1",
        email: "nurse@medscope.ai",
        first_name: "Demo",
        last_name: "Nurse",
        role: "nurse",
      }),
    ).toBe("Demo Nurse");
  });

  it("formats patient snapshot from de-identified fields", () => {
    expect(
      formatPatientSnapshot({
        age: 65,
        gender: "Female",
        glucose: 140,
        hospital_stay_days: 3,
      }),
    ).toBe("Age 65 · Female · Glucose 140 · Stay 3d");
  });

  it("formats pagination range label", () => {
    expect(formatHistoryRangeLabel(20, 20, 45)).toBe("Showing 21–40 of 45");
    expect(formatHistoryRangeLabel(0, 20, 0)).toBe("No evaluations");
  });
});
