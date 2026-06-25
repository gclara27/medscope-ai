import { History } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Alert } from "@/components/Alert";
import { HistoryEvaluationsTable } from "@/components/clinical/HistoryEvaluationsTable";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatHistoryRangeLabel } from "@/lib/historyDisplay";
import { listHistory } from "@/services/history";
import type { HistoryListItem } from "@/types/history";
import { getHistoryErrorMessage } from "@/utils/historyErrors";

const HISTORY_PAGE_SIZE = 20;

export function HistoryPage() {
  const [items, setItems] = useState<HistoryListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async (nextOffset: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await listHistory({
        limit: HISTORY_PAGE_SIZE,
        offset: nextOffset,
      });
      setItems(response.items);
      setTotal(response.total);
      setOffset(response.offset);
    } catch (loadError) {
      setItems([]);
      setTotal(0);
      setError(getHistoryErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory(0);
  }, [loadHistory]);

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

  return (
    <div className="space-y-8 p-4 md:p-8">
      <header>
        <p className="text-sm font-medium uppercase tracking-wide text-primary">
          Clinical audit trail
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-on-surface md:text-3xl">
          Prediction History
        </h1>
        <p className="mt-2 max-w-2xl text-on-surface-variant">
          Review stored readmission risk evaluations and who performed them (UC-050, RF-050).
        </p>
      </header>

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
                No evaluations found yet. Clinicians can generate predictions from Evaluation to
                populate this list.
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
    </div>
  );
}
