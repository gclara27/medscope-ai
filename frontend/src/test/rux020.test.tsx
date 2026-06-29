/**
 * RUX-020 / RUX-021 — contrast and readable typography (T-712).
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { AppLayout } from "@/layouts/AppLayout";
import { contrastRatio } from "@/lib/accessibility/contrast";
import { DARK_CONTRAST_PAIRS, LIGHT_CONTRAST_PAIRS } from "@/lib/accessibility/designTokens";

const useAuthMock = vi.fn();

vi.mock("@/context/useAuth", () => ({
  useAuth: () => useAuthMock(),
}));

const cssPath = resolve(dirname(fileURLToPath(import.meta.url)), "../index.css");
const indexCss = readFileSync(cssPath, "utf8");

function pairsFromTheme(pairs: typeof LIGHT_CONTRAST_PAIRS) {
  return pairs.map((pair) => ({
    ...pair,
    ratio: contrastRatio(pair.foreground, pair.background),
  }));
}

describe("RUX-020 design token contrast", () => {
  it.each(pairsFromTheme(LIGHT_CONTRAST_PAIRS))(
    "light — $name meets WCAG AA ($ratio >= $minRatio)",
    ({ ratio, minRatio }) => {
      expect(ratio).toBeGreaterThanOrEqual(minRatio);
    },
  );

  it.each(pairsFromTheme(DARK_CONTRAST_PAIRS))(
    "dark — $name meets WCAG AA ($ratio >= $minRatio)",
    ({ ratio, minRatio }) => {
      expect(ratio).toBeGreaterThanOrEqual(minRatio);
    },
  );
});

describe("RUX-021 readable typography base styles", () => {
  it("sets 16px root font size and readable meta label size", () => {
    expect(indexCss).toMatch(/html\s*\{[^}]*font-size:\s*16px/);
    expect(indexCss).toMatch(/\.meta-label\s*\{[^}]*text-sm/);
  });

  it("respects prefers-reduced-motion for animations", () => {
    expect(indexCss).toMatch(/prefers-reduced-motion:\s*reduce/);
  });
});

describe("RUX-020 skip navigation", () => {
  it("exposes skip link targeting main content", () => {
    useAuthMock.mockReturnValue({
      user: {
        id: "1",
        email: "clinician@medscope.ai",
        first_name: "Clara",
        last_name: "Clinician",
        role: "clinician",
        permissions: {
          dashboard: true,
          evaluation: true,
          simulation: true,
          history: true,
          analytics: false,
          settings: true,
        },
      },
      logout: vi.fn(),
      isLoading: false,
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<div>Dashboard content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    const skipLink = screen.getByRole("link", { name: /skip to main content/i });
    expect(skipLink).toHaveAttribute("href", "#main-content");

    const main = document.getElementById("main-content");
    expect(main).toBeTruthy();
    expect(main?.tagName).toBe("MAIN");
  });
});
