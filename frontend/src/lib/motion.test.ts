import { describe, expect, it, vi } from "vitest";

import { easeOutCubic, prefersReducedMotion } from "@/lib/motion";

describe("motion (T-908-03)", () => {
  it("easeOutCubic accelerates toward the end", () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
  });

  it("prefersReducedMotion reads matchMedia", () => {
    const matchMedia = vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    expect(prefersReducedMotion()).toBe(true);
    matchMedia.mockRestore();
  });
});
