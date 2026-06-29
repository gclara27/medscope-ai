import { THEME_STORAGE_KEY } from "@/utils/storage";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const VALID_PREFERENCES: ThemePreference[] = ["light", "dark", "system"];

export function isThemePreference(value: string | null | undefined): value is ThemePreference {
  return VALID_PREFERENCES.includes(value as ThemePreference);
}

/** Maps stored preference to the active light/dark class (T-X03-04). */
export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === "dark") {
    return "dark";
  }
  if (preference === "light") {
    return "light";
  }
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

export function readStoredThemePreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (isThemePreference(stored)) {
      return stored;
    }
  } catch {
    // Storage blocked (private mode, SSR).
  }
  return "system";
}

export function applyResolvedTheme(resolved: ResolvedTheme): void {
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
}

/** Apply stored or system theme before React mounts (pairs with anti-FOUC in index.html). */
export function initializeTheme(): ResolvedTheme {
  return applyThemePreference(readStoredThemePreference());
}

export function persistThemePreference(preference: ThemePreference): void {
  localStorage.setItem(THEME_STORAGE_KEY, preference);
}

/** Persist optional — use applyThemePreference when user changes setting. */
export function applyThemePreference(preference: ThemePreference): ResolvedTheme {
  const resolved = resolveTheme(preference);
  applyResolvedTheme(resolved);
  return resolved;
}
