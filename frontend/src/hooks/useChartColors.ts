import { useMemo, useSyncExternalStore } from "react";

import { getChartColors, type ChartColorPalette } from "@/lib/chartTheme";

function subscribeToDocumentClass(callback: () => void): () => void {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getResolvedThemeSnapshot(): "light" | "dark" {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/** Theme-aware Recharts palette — tracks `<html class="dark">` (T-X03-06). */
export function useChartColors(): ChartColorPalette {
  const resolvedTheme = useSyncExternalStore(
    subscribeToDocumentClass,
    getResolvedThemeSnapshot,
    () => "light",
  );

  return useMemo(() => getChartColors(), [resolvedTheme]);
}
