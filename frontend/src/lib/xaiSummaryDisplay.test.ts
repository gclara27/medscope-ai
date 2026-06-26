import { describe, expect, it } from "vitest";

import { CLINICAL_DISCLAIMER, parseClinicalSummary } from "@/lib/xaiSummaryDisplay";

describe("parseClinicalSummary", () => {
  it("parses risk drivers, protective factors, and disclaimer", () => {
    const summary =
      "Main risk drivers: Prior inpatient visits, Medication count. " +
      "Factors associated with lower risk: Age. " +
      CLINICAL_DISCLAIMER;

    const parsed = parseClinicalSummary(summary);

    expect(parsed.paragraphs).toHaveLength(2);
    expect(parsed.paragraphs[0]).toMatchObject({
      kind: "risk_drivers",
      features: ["Prior inpatient visits", "Medication count"],
    });
    expect(parsed.paragraphs[1]).toMatchObject({
      kind: "protective_factors",
      features: ["Age"],
    });
    expect(parsed.disclaimer).toBe(CLINICAL_DISCLAIMER);
  });

  it("returns empty structure for blank summary", () => {
    expect(parseClinicalSummary("   ")).toEqual({
      paragraphs: [],
      disclaimer: null,
    });
  });

  it("keeps unrecognized sentences as general paragraphs", () => {
    const parsed = parseClinicalSummary("Moderate readmission risk based on clinical profile.");
    expect(parsed.paragraphs[0]).toMatchObject({
      kind: "general",
      raw: "Moderate readmission risk based on clinical profile.",
    });
  });
});
