import { useEffect, useId, useState } from "react";

import { FieldError } from "@/components/clinical/FieldError";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ANALYTICS_DATE_PRESET_LABELS,
  buildAnalyticsDateRangeValue,
  validateAnalyticsDateRange,
} from "@/lib/analyticsDateRange";
import { cn } from "@/lib/utils";
import type { AnalyticsDatePreset, AnalyticsDateRangeValue } from "@/types/analytics";

const selectClassName = cn(
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground",
  "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
);

const PRESET_OPTIONS: AnalyticsDatePreset[] = ["last_30", "last_90", "ytd", "all", "custom"];

interface AnalyticsDateRangeFilterProps {
  value: AnalyticsDateRangeValue;
  onChange: (value: AnalyticsDateRangeValue) => void;
  disabled?: boolean;
  className?: string;
}

/** Temporal range selector for analytics dashboard (T-607, RF-061). */
export function AnalyticsDateRangeFilter({
  value,
  onChange,
  disabled = false,
  className,
}: AnalyticsDateRangeFilterProps) {
  const selectId = useId();
  const fromId = useId();
  const toId = useId();
  const errorId = useId();
  const [customDraft, setCustomDraft] = useState({
    date_from: value.date_from ?? "",
    date_to: value.date_to ?? "",
  });
  const [customError, setCustomError] = useState<string | null>(null);

  useEffect(() => {
    if (value.preset === "custom") {
      setCustomDraft({
        date_from: value.date_from ?? "",
        date_to: value.date_to ?? "",
      });
    }
  }, [value.date_from, value.date_to, value.preset]);

  function handlePresetChange(nextPreset: AnalyticsDatePreset) {
    setCustomError(null);

    if (nextPreset === "custom") {
      const draft = {
        date_from: customDraft.date_from || value.date_from || "",
        date_to: customDraft.date_to || value.date_to || "",
      };
      setCustomDraft(draft);
      onChange({
        preset: "custom",
        date_from: draft.date_from || undefined,
        date_to: draft.date_to || undefined,
      });
      return;
    }

    onChange(buildAnalyticsDateRangeValue(nextPreset));
  }

  function handleCustomApply() {
    const nextValue: AnalyticsDateRangeValue = {
      preset: "custom",
      date_from: customDraft.date_from,
      date_to: customDraft.date_to,
    };
    const error = validateAnalyticsDateRange(nextValue);
    setCustomError(error);

    if (!error) {
      onChange(nextValue);
    }
  }

  return (
    <div className={cn("flex w-full flex-col gap-3 sm:w-auto", className)}>
      <div className="relative w-full sm:w-52">
        <Label htmlFor={selectId} className="sr-only">
          Analytics date range
        </Label>
        <select
          id={selectId}
          className={selectClassName}
          value={value.preset}
          disabled={disabled}
          onChange={(event) => handlePresetChange(event.target.value as AnalyticsDatePreset)}
          aria-label="Analytics date range"
        >
          {PRESET_OPTIONS.map((preset) => (
            <option key={preset} value={preset}>
              {ANALYTICS_DATE_PRESET_LABELS[preset]}
            </option>
          ))}
        </select>
      </div>

      {value.preset === "custom" ? (
        <div className="flex w-full flex-col gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-4 sm:w-auto">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={fromId}>From</Label>
              <Input
                id={fromId}
                type="date"
                value={customDraft.date_from}
                disabled={disabled}
                onChange={(event) =>
                  setCustomDraft((current) => ({
                    ...current,
                    date_from: event.target.value,
                  }))
                }
                aria-invalid={Boolean(customError)}
                aria-describedby={customError ? errorId : undefined}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={toId}>To</Label>
              <Input
                id={toId}
                type="date"
                value={customDraft.date_to}
                disabled={disabled}
                onChange={(event) =>
                  setCustomDraft((current) => ({
                    ...current,
                    date_to: event.target.value,
                  }))
                }
                aria-invalid={Boolean(customError)}
                aria-describedby={customError ? errorId : undefined}
              />
            </div>
          </div>
          <FieldError id={errorId} message={customError ?? undefined} />
          <Button
            type="button"
            variant="secondary"
            className="self-start"
            disabled={disabled}
            onClick={handleCustomApply}
          >
            Apply range
          </Button>
        </div>
      ) : null}
    </div>
  );
}
