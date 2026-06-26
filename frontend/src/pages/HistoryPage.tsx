import { History } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Alert } from "@/components/Alert";
import { HistoryEvaluationsTable } from "@/components/clinical/HistoryEvaluationsTable";
import { HistoryFiltersPanel } from "@/components/clinical/HistoryFiltersPanel";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { getRouteIcon } from "@/config/navigation";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatHistoryRangeLabel } from "@/lib/historyDisplay";
import {
  DEFAULT_HISTORY_FILTERS,
  getHistoryFiltersSummary,
  hasActiveHistoryFilters,
  mergeEvaluatorOptions,
  type HistoryFiltersValue,
  resolveHistoryFilters,
} from "@/lib/historyFilters";
import { listHistory } from "@/services/history";
import type { HistoryListItem, HistoryUserSummary } from "@/types/history";
import { getHistoryErrorMessage } from "@/utils/historyErrors";

const HISTORY_PAGE_SIZE = 20;
const EVALUATOR_DISCOVERY_LIMIT = 100;

export function HistoryPage() {
  const [filters, setFilters] = useState<HistoryFiltersValue>(DEFAULT_HISTORY_FILTERS);
  const [evaluatorOptions, setEvaluatorOptions] = useState<HistoryUserSummary[]>([]);
  const [items, setItems] = useState<HistoryListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryFilters = useMemo(() => resolveHistoryFilters(filters), [filters]);
  const filtersActive = hasActiveHistoryFilters(filters);

  const loadHistory = useCallback(
    async (nextOffset: number) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await listHistory({
          ...queryFilters,
          limit: HISTORY_PAGE_SIZE,
          offset: nextOffset,
        });
        setItems(response.items);
        setTotal(response.total);
        setOffset(response.offset);
        setEvaluatorOptions((current) => mergeEvaluatorOptions(current, response.items));
      } catch (loadError) {
        setItems([]);
        setTotal(0);
        setError(getHistoryErrorMessage(loadError));
      } finally {
        setIsLoading(false);
      }
    },
    [queryFilters],
  );

  useEffect(() => {
    void loadHistory(0);
  }, [loadHistory]);

  useEffect(() => {
    let cancelled = false;

    void listHistory({ limit: EVALUATOR_DISCOVERY_LIMIT, offset: 0 })
      .then((response) => {
        if (!cancelled) {
          setEvaluatorOptions((current) => mergeEvaluatorOptions(current, response.items));
        }
      })
      .catch(() => {
        // Evaluator discovery is best-effort; the main list still loads separately.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const hasPrevious = offset > 0;
  const hasNext = offset + HISTORY_PAGE_SIZE < total;

  function handlePreviousPage() {
    if (!hasPrevious || isLoading) {
      return;
    }
    void loadHistory(Math.max(0, offset - HISTORY_PAGE_SIZE));
  }

  function handleNextPage() {
    if (!hasNext || isLoading) {
      return;
    }
    void loadHistory(offset + HISTORY_PAGE_SIZE);
  }

  function handleResetFilters() {
    setFilters(DEFAULT_HISTORY_FILTERS);
  }

  return (
    <PageShell>
      <PageHeader
        icon={getRouteIcon("/history")}
        eyebrow="Clinical audit trail"
        title="Prediction History"
        description="Review stored readmission risk evaluations and filter by date, risk level, or evaluator."
        meta={<>Active filters: {getHistoryFiltersSummary(filters, evaluatorOptions)}</>}
      />

      <HistoryFiltersPanel
        value={filters}
        evaluators={evaluatorOptions}
        onChange={setFilters}
        onReset={handleResetFilters}
        disabled={isLoading}
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      <Card>
        <CardHeader className="flex flex-col gap-4 border-b border-outline-variant sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-5 w-5 text-primary" aria-hidden />
            Historical AI evaluations
          </CardTitle>
          <p className="text-sm text-on-surface-variant">
            {formatHistoryRangeLabel(offset, HISTORY_PAGE_SIZE, total)}
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner label="Loading prediction history" />
            </div>
          ) : items.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-on-surface-variant">
                {filtersActive
                  ? "No evaluations match the selected filters. Try adjusting the date range, risk level, or evaluator."
                  : "No evaluations found yet. Clinicians can generate predictions from Evaluation to populate this list."}
              </p>
            </div>
          ) : (
            <HistoryEvaluationsTable items={items} />
          )}
        </CardContent>
        {total > HISTORY_PAGE_SIZE ? (
          <div className="flex items-center justify-end gap-2 border-t border-outline-variant px-6 py-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={!hasPrevious || isLoading}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={!hasNext || isLoading}
            >
              Next
            </Button>
          </div>
        ) : null}
      </Card>
    </PageShell>
  );
}
