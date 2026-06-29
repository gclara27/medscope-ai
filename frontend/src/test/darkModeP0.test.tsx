import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RiskGaugeChart } from "@/components/charts/RiskGaugeChart";
import { AppearancePanel } from "@/components/settings/AppearancePanel";
import { ThemeProvider } from "@/context/ThemeProvider";
import { LoginPage } from "@/pages/LoginPage";
import { SplashPage } from "@/pages/SplashPage";
import { UnauthorizedPage } from "@/pages/UnauthorizedPage";
import { getChartColors } from "@/lib/chartTheme";
import { THEME_STORAGE_KEY } from "@/utils/storage";

const loginMock = vi.fn();

vi.mock("@/context/useAuth", () => ({
  useAuth: () => ({
    user: { role: "nurse", first_name: "Nora", last_name: "Nurse" },
    login: loginMock,
    isAuthenticated: false,
    isLoading: false,
  }),
}));

function renderWithRouter(ui: React.ReactElement, initialPath = "/") {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[initialPath]}>{ui}</MemoryRouter>
    </ThemeProvider>,
  );
}

describe("dark mode P0 screens (T-X03-07/08, RTS-043)", () => {
  beforeEach(() => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
    document.documentElement.classList.add("dark");
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute("content", "#0058bc");
  });

  it("login page keeps semantic surfaces in dark", () => {
    renderWithRouter(<LoginPage />);

    expect(screen.getByRole("heading", { name: /medscope ai/i })).toHaveClass("text-on-surface");
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it("splash hero remains readable in dark", () => {
    renderWithRouter(<SplashPage />);

    expect(screen.getByRole("heading", { name: /medscope ai/i })).toHaveClass("text-primary");
    expect(screen.getByRole("button", { name: /get started/i })).toBeInTheDocument();
  });

  it("bootstraps dark from system preference when no theme is stored", () => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");

    const matchMedia = vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
      matches: query === "(prefers-color-scheme: dark)",
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    renderWithRouter(<SplashPage />);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(screen.getByRole("heading", { name: /medscope ai/i })).toHaveClass("text-primary");

    matchMedia.mockRestore();
  });

  it("unauthorized fallback card uses tokenized surfaces", () => {
    renderWithRouter(<UnauthorizedPage />);

    expect(screen.getByRole("heading", { name: /insufficient permissions/i })).toHaveClass(
      "text-on-surface",
    );
  });

  it("risk gauge resolves dark palette colors", () => {
    render(
      <ThemeProvider>
        <RiskGaugeChart riskPercent={62} riskLevel="high" />
      </ThemeProvider>,
    );

    const colors = getChartColors();
    expect(colors.high).toMatch(/rgb\(255,\s*107,\s*107\)|#ff6b6b/i);
    expect(colors.gaugeTrack).toBe("#222a3d");
    expect(screen.getByText("HIGH RISK")).toHaveClass("text-risk-high");
  });

  it("appearance panel switches back to light without regression", async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <AppearancePanel />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole("radio", { name: /light/i }));

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(getChartColors().grid).toBe("#e1e3e4");
  });
});
