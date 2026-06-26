import { describe, expect, it } from "vitest";

import {
  formatRiskDelta,
  formatRiskDeltaWithLevel,
  riskDeltaDirection,
} from "@/lib/simulationDisplay";

describe("simulationDisplay", () => {
  it("formats signed risk delta", () => {
    expect(formatRiskDelta(-7)).toBe("-7.0 pts");
    expect(formatRiskDelta(3.25)).toBe("+3.3 pts");
    expect(formatRiskDelta(0)).toBe("0.0 pts");
  });

  it("includes risk level in delta label", () => {
    expect(formatRiskDeltaWithLevel(-7, "medium")).toBe("-7.0 pts (Medium risk)");
  });

  it("classifies delta direction", () => {
    expect(riskDeltaDirection(1)).toBe("up");
    expect(riskDeltaDirection(-1)).toBe("down");
    expect(riskDeltaDirection(0)).toBe("unchanged");
  });
});
