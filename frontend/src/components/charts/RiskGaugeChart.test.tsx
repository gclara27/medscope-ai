import { act, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RiskGaugeChart } from "@/components/charts/RiskGaugeChart";
import { renderWithTheme } from "@/test/renderWithTheme";
import { THEME_STORAGE_KEY } from "@/utils/storage";

function mockReducedMotion(reduced: boolean) {
  return vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
    matches: reduced && query === "(prefers-reduced-motion: reduce)",
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe("RiskGaugeChart", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders risk percent and level in accessible label", () => {
    mockReducedMotion(false);
    renderWithTheme(<RiskGaugeChart riskPercent={78.2} riskLevel="high" />);

    expect(screen.getByRole("img")).toHaveAttribute(
      "aria-label",
      expect.stringMatching(/78\.2 percent/i),
    );
    expect(screen.getByText("HIGH RISK")).toBeInTheDocument();
    expect(screen.getByText(/78\.2/)).toBeInTheDocument();
  });

  it("clamps percent display to 0–100", () => {
    mockReducedMotion(false);
    renderWithTheme(<RiskGaugeChart riskPercent={150} riskLevel="high" />);

    expect(screen.getByText(/100\.0/)).toBeInTheDocument();
  });

  it("applies RUX-011 risk color classes per level", () => {
    mockReducedMotion(false);
    const { rerender } = renderWithTheme(<RiskGaugeChart riskPercent={78} riskLevel="high" />);
    expect(screen.getByText("HIGH RISK")).toHaveClass("text-risk-high-readable");

    rerender(<RiskGaugeChart riskPercent={42} riskLevel="medium" />);
    expect(screen.getByText("MEDIUM RISK")).toHaveClass("text-risk-medium-readable");

    rerender(<RiskGaugeChart riskPercent={18} riskLevel="low" />);
    expect(screen.getByText("LOW RISK")).toHaveClass("text-risk-low-readable");
  });

  it("shows custom title", () => {
    mockReducedMotion(false);
    renderWithTheme(
      <RiskGaugeChart
        riskPercent={25}
        riskLevel="low"
        title="Readmission probability"
      />,
    );

    expect(screen.getByText(/readmission probability/i)).toBeInTheDocument();
  });

  describe("simulation animation (T-908-01)", () => {
    beforeEach(() => {
      mockReducedMotion(false);
    });

    it("animates from animateFromPercent toward the target value", async () => {
      const rafCallbacks: FrameRequestCallback[] = [];
      vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
        rafCallbacks.push(cb);
        return rafCallbacks.length;
      });

      let now = 0;
      vi.spyOn(performance, "now").mockImplementation(() => now);

      renderWithTheme(
        <RiskGaugeChart
          riskPercent={50}
          riskLevel="medium"
          animateFromPercent={30}
          animationKey="sim-1"
        />,
      );

      expect(screen.getByText(/30\.0/)).toBeInTheDocument();

      for (const timestamp of [0, 400, 800]) {
        now = timestamp;
        const pending = [...rafCallbacks];
        rafCallbacks.length = 0;
        await act(async () => {
          for (const callback of pending) {
            callback(timestamp);
          }
        });
      }

      expect(screen.getByText(/50\.0/)).toBeInTheDocument();
    });

    it("skips animation when prefers-reduced-motion is enabled", () => {
      mockReducedMotion(true);

      renderWithTheme(
        <RiskGaugeChart
          riskPercent={50}
          riskLevel="medium"
          animateFromPercent={30}
          animationKey="sim-2"
        />,
      );

      expect(screen.getByText(/50\.0/)).toBeInTheDocument();
      expect(screen.queryByText(/30\.0/)).not.toBeInTheDocument();
    });
  });

  describe("dark mode (T-908-04)", () => {
    it("renders readable risk badge in dark theme", () => {
      localStorage.setItem(THEME_STORAGE_KEY, "dark");
      mockReducedMotion(false);

      renderWithTheme(<RiskGaugeChart riskPercent={62} riskLevel="high" />);

      expect(screen.getByText("HIGH RISK")).toHaveClass("text-risk-high-readable");
      expect(screen.getByRole("img")).toHaveAttribute(
        "aria-label",
        expect.stringMatching(/62\.0 percent/i),
      );
    });
  });
});
