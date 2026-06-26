import { describe, expect, it } from "vitest";

import { RISK_COLORS as SHARED_RISK_COLORS } from "../../riskColors.js";

import {
  RISK_BADGE_CLASSES,
  RISK_COLORS,
  RISK_STYLES,
  RISK_TEXT_CLASSES,
} from "@/lib/riskDisplay";

describe("riskDisplay (RUX-011)", () => {
  it("uses the shared risk color tokens", () => {
    expect(RISK_COLORS).toEqual(SHARED_RISK_COLORS);
    expect(RISK_COLORS.low).toBe("#16a34a");
    expect(RISK_COLORS.medium).toBe("#f59e0b");
    expect(RISK_COLORS.high).toBe("#dc2626");
  });

  it("maps each risk level to tailwind risk utilities", () => {
    expect(RISK_TEXT_CLASSES.low).toBe("text-risk-low");
    expect(RISK_TEXT_CLASSES.medium).toBe("text-risk-medium");
    expect(RISK_TEXT_CLASSES.high).toBe("text-risk-high");

    expect(RISK_BADGE_CLASSES.low).toContain("risk-low");
    expect(RISK_BADGE_CLASSES.medium).toContain("risk-medium");
    expect(RISK_BADGE_CLASSES.high).toContain("risk-high");

    expect(RISK_STYLES.low).toContain("risk-low");
    expect(RISK_STYLES.medium).toContain("risk-medium");
    expect(RISK_STYLES.high).toContain("risk-high");
  });
});
