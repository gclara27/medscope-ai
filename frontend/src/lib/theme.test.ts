import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  applyResolvedTheme,
  applyThemePreference,
  initializeTheme,
  readStoredThemePreference,
  resolveTheme,
} from "@/lib/theme";
import { THEME_STORAGE_KEY } from "@/utils/storage";

describe("theme (T-X03-04)", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("defaults to light when nothing is stored", () => {
    expect(readStoredThemePreference()).toBe("light");
    expect(resolveTheme("light")).toBe("light");
  });

  it("resolves dark and system preferences", () => {
    expect(resolveTheme("dark")).toBe("dark");

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

    expect(resolveTheme("system")).toBe("dark");

    matchMedia.mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    expect(resolveTheme("system")).toBe("light");
    matchMedia.mockRestore();
  });

  it("reads valid stored preferences", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
    expect(readStoredThemePreference()).toBe("dark");

    localStorage.setItem(THEME_STORAGE_KEY, "system");
    expect(readStoredThemePreference()).toBe("system");

    localStorage.setItem(THEME_STORAGE_KEY, "invalid");
    expect(readStoredThemePreference()).toBe("light");
  });

  it("toggles the dark class on documentElement", () => {
    applyResolvedTheme("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe("dark");

    applyResolvedTheme("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe("light");
  });

  it("initializeTheme defaults to light when nothing is stored", () => {
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

    localStorage.clear();
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";

    expect(initializeTheme()).toBe("light");
    expect(readStoredThemePreference()).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    matchMedia.mockRestore();
  });

  it("applyThemePreference resolves and applies", () => {
    const resolved = applyThemePreference("dark");
    expect(resolved).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
