import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { CHART_COLORS_DARK, CHART_COLORS_LIGHT, getBarHighlightFill, getChartColors } from "@/lib/chartTheme";

describe("chartTheme (T-X03-06)", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    document.documentElement.classList.remove("dark");
  });

  it("exposes static light and dark reference palettes", () => {
    expect(CHART_COLORS_LIGHT.primary).toBe("#0058bc");
    expect(CHART_COLORS_DARK.primary).toBe("#adc6ff");
    expect(CHART_COLORS_DARK.teal).toBe("#4edea3");
  });

  it("reads light tokens from CSS variables", () => {
    const colors = getChartColors();
    expect(colors.low).toMatch(/rgb\(22,\s*163,\s*74\)|#16a34a/i);
    expect(colors.grid).toBe("#e1e3e4");
  });

  it("reads dark tokens when html has dark class", () => {
    document.documentElement.classList.add("dark");
    const colors = getChartColors();
    expect(colors.grid).toBe("#222a3d");
    expect(colors.primary).toMatch(/rgb\(173,\s*198,\s*255\)|#adc6ff/i);
    expect(getBarHighlightFill(colors)).toBe("rgba(173, 198, 255, 0.14)");
  });
});
