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

export const HISTORY_FILTER_SELECT_CLASSNAME = cn(
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground",
  "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
);

const PRESET_OPTIONS: AnalyticsDatePreset[] = ["last_30", "last_90", "ytd", "all", "custom"];

interface HistoryDateRangeEditorOptions {
  value: AnalyticsDateRangeValue;
  onChange: (value: AnalyticsDateRangeValue) => void;
}

export function useHistoryDateRangeEditor({ value, onChange }: HistoryDateRangeEditorOptions) {
  const [customDraft, setCustomDraft] = useState({
    date_from: value.date_from ?? "",
    date_to: value.date_to ?? "",
  });
  const [customError, setCustomError] = useState<string | null>(null);
  const isCustom = value.preset === "custom";

  useEffect(() => {
    if (isCustom) {
      setCustomDraft({
        date_from: value.date_from ?? "",
        date_to: value.date_to ?? "",
      });
    }
  }, [isCustom, value.date_from, value.date_to]);

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

  return {
    isCustom,
    customDraft,
    customError,
    setCustomDraft,
    handlePresetChange,
    handleCustomApply,
  };
}

interface HistoryDateRangePresetSelectProps {
  value: AnalyticsDateRangeValue;
  onPresetChange: (preset: AnalyticsDatePreset) => void;
  disabled?: boolean;
  label?: string;
  labelClassName?: string;
  id?: string;
}

export function HistoryDateRangePresetSelect({
  value,
  onPresetChange,
  disabled = false,
  label = "Date range",
  labelClassName,
  id,
}: HistoryDateRangePresetSelectProps) {
  const fallbackId = useId();
  const selectId = id ?? fallbackId;

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Label htmlFor={selectId} className={labelClassName}>
        {label}
      </Label>
      <select
        id={selectId}
        className={HISTORY_FILTER_SELECT_CLASSNAME}
        value={value.preset}
        disabled={disabled}
        onChange={(event) => onPresetChange(event.target.value as AnalyticsDatePreset)}
        aria-label="Date range filter"
      >
        {PRESET_OPTIONS.map((preset) => (
          <option key={preset} value={preset}>
            {ANALYTICS_DATE_PRESET_LABELS[preset]}
          </option>
        ))}
      </select>
    </div>
  );
}

interface HistoryCustomDateInputsProps {
  customDraft: { date_from: string; date_to: string };
  onDraftChange: (draft: { date_from: string; date_to: string }) => void;
  customError: string | null;
  disabled?: boolean;
}

export function HistoryCustomDateInputs({
  customDraft,
  onDraftChange,
  customError,
  disabled = false,
}: HistoryCustomDateInputsProps) {
  const fromId = useId();
  const toId = useId();
  const errorId = useId();

  return (
    <>
      <div className="flex min-w-0 flex-col gap-2">
        <Label htmlFor={fromId}>From</Label>
        <Input
          id={fromId}
          type="date"
          className="h-10"
          value={customDraft.date_from}
          disabled={disabled}
          onChange={(event) =>
            onDraftChange({
              ...customDraft,
              date_from: event.target.value,
            })
          }
          aria-invalid={Boolean(customError)}
          aria-describedby={customError ? errorId : undefined}
        />
      </div>

      <div className="flex min-w-0 flex-col gap-2">
        <Label htmlFor={toId}>To</Label>
        <Input
          id={toId}
          type="date"
          className="h-10"
          value={customDraft.date_to}
          disabled={disabled}
          onChange={(event) =>
            onDraftChange({
              ...customDraft,
              date_to: event.target.value,
            })
          }
          aria-invalid={Boolean(customError)}
          aria-describedby={customError ? errorId : undefined}
        />
      </div>
    </>
  );
}

interface HistoryCustomDateApplyRowProps {
  customError: string | null;
  onApply: () => void;
  disabled?: boolean;
}

export function HistoryCustomDateApplyRow({
  customError,
  onApply,
  disabled = false,
}: HistoryCustomDateApplyRowProps) {
  const errorId = useId();

  return (
    <div>
      <FieldError id={errorId} message={customError ?? undefined} />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="mt-2"
        disabled={disabled}
        onClick={onApply}
      >
        Apply range
      </Button>
    </div>
  );
}
