import { Filter } from "lucide-react";
import { useId } from "react";

import {
  HistoryCustomDateApplyRow,
  HistoryCustomDateInputs,
  HistoryDateRangePresetSelect,
  HISTORY_FILTER_SELECT_CLASSNAME,
  useHistoryDateRangeEditor,
} from "@/components/clinical/HistoryDateRangeFields";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  HISTORY_RISK_FILTER_OPTIONS,
  type HistoryFiltersValue,
} from "@/lib/historyFilters";
import { formatEvaluatorName } from "@/lib/historyDisplay";
import { cn } from "@/lib/utils";
import type { HistoryUserSummary } from "@/types/history";

interface HistoryFiltersPanelProps {
  value: HistoryFiltersValue;
  evaluators: HistoryUserSummary[];
  onChange: (value: HistoryFiltersValue) => void;
  onReset: () => void;
  disabled?: boolean;
  className?: string;
}

/** History search filters for date, risk level, and evaluator (T-602, RF-051, UC-051). */
export function HistoryFiltersPanel({
  value,
  evaluators,
  onChange,
  onReset,
  disabled = false,
  className,
}: HistoryFiltersPanelProps) {
  const riskId = useId();
  const evaluatorId = useId();
  const {
    isCustom,
    customDraft,
    customError,
    setCustomDraft,
    handlePresetChange,
    handleCustomApply,
  } = useHistoryDateRangeEditor({
    value: value.dateRange,
    onChange: (dateRange) => onChange({ ...value, dateRange }),
  });

  return (
    <section
      aria-label="History search filters"
      className={cn(
        "rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm",
        className,
      )}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-on-surface">
          <Filter className="h-4 w-4 text-primary" aria-hidden />
          Search filters
        </h2>
        <Button type="button" variant="ghost" size="sm" onClick={onReset} disabled={disabled}>
          Reset
        </Button>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-3 lg:items-end">
          <HistoryDateRangePresetSelect
            value={value.dateRange}
            onPresetChange={handlePresetChange}
            disabled={disabled}
          />

          <div className="flex min-w-0 flex-col gap-2">
            <Label htmlFor={riskId}>Risk level</Label>
            <select
              id={riskId}
              className={HISTORY_FILTER_SELECT_CLASSNAME}
              value={value.risk_level}
              disabled={disabled}
              onChange={(event) =>
                onChange({
                  ...value,
                  risk_level: event.target.value as HistoryFiltersValue["risk_level"],
                })
              }
              aria-label="Risk level filter"
            >
              {HISTORY_RISK_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex min-w-0 flex-col gap-2">
            <Label htmlFor={evaluatorId}>Evaluator</Label>
            <select
              id={evaluatorId}
              className={HISTORY_FILTER_SELECT_CLASSNAME}
              value={value.user_id}
              disabled={disabled}
              onChange={(event) =>
                onChange({
                  ...value,
                  user_id: event.target.value,
                })
              }
              aria-label="Evaluator filter"
            >
              <option value="all">All evaluators</option>
              {evaluators.map((evaluator) => (
                <option key={evaluator.id} value={evaluator.id}>
                  {formatEvaluatorName(evaluator)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isCustom ? (
          <div className="space-y-3 border-t border-outline-variant pt-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:max-w-2xl lg:items-end">
              <HistoryCustomDateInputs
                customDraft={customDraft}
                onDraftChange={setCustomDraft}
                customError={customError}
                disabled={disabled}
              />
            </div>
            <HistoryCustomDateApplyRow
              customError={customError}
              onApply={handleCustomApply}
              disabled={disabled}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
