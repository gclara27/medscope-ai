import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { AppearancePanel } from "@/components/settings/AppearancePanel";
import { ThemeProvider } from "@/context/ThemeProvider";
import { THEME_STORAGE_KEY } from "@/utils/storage";

function renderPanel() {
  return render(
    <ThemeProvider>
      <AppearancePanel />
    </ThemeProvider>,
  );
}

describe("AppearancePanel (T-X03-05, RTS-043)", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("renders light, dark, and system options", () => {
    renderPanel();

    expect(screen.getByRole("radio", { name: /light/i })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: /light/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /dark/i })).toBeInTheDocument();
  });

  it("switches to dark theme", async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(screen.getByRole("radio", { name: /dark/i }));

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(screen.getByText(/active theme:/i)).toHaveTextContent(/dark/i);
  });

  it("switches to system theme", async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(screen.getByRole("radio", { name: /system/i }));

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("system");
    expect(screen.getByText(/active theme:/i)).toHaveTextContent(/system/i);
  });
});
