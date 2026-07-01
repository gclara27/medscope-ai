import { Monitor, Moon, Sun } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/context/useTheme";
import { cn } from "@/lib/utils";
import type { ThemePreference } from "@/lib/theme";

interface ThemeOption {
  value: ThemePreference;
  label: string;
  description: string;
  icon: LucideIcon;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    value: "light",
    label: "Light",
    description: "Default clinical theme for well-lit environments.",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Dark",
    description: "Deep navy theme for low-light workspaces.",
    icon: Moon,
  },
  {
    value: "system",
    label: "System",
    description: "Match your device light or dark preference.",
    icon: Monitor,
  },
];

/** Theme selector for Settings → Appearance (T-X03-05, UC-086). */
export function AppearancePanel() {
  const { preference, resolvedTheme, setTheme } = useTheme();

  return (
    <Card className="shadow-level-1">
      <CardHeader className="border-b border-outline-variant">
        <CardTitle className="text-base">Appearance</CardTitle>
        <p className="text-sm text-on-surface-variant">
          Choose how MedScope AI looks on this device. The app starts in Light mode by default.
          Select Dark or System to override. Your choice is saved locally on this browser.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <fieldset>
          <legend className="sr-only">Color theme</legend>
          <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Color theme">
            {THEME_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = preference === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={option.label}
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    "flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-[inset_0_0_0_1px_rgb(var(--color-primary))]"
                      : "border-outline-variant bg-surface-container-lowest hover:border-primary/40 hover:bg-surface-container-low",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex rounded-lg p-2",
                      isSelected ? "bg-primary text-on-primary" : "bg-surface-container text-primary",
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-on-surface">{option.label}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-on-surface-variant">
                      {option.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <p className="text-xs text-on-surface-variant">
          Active theme:{" "}
          <span className="font-medium text-on-surface">
            {preference === "system"
              ? `System (${resolvedTheme})`
              : preference.charAt(0).toUpperCase() + preference.slice(1)}
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
