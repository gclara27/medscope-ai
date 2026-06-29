import { lazy, startTransition, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { FileDown } from "lucide-react";

import { AnalyticsChartsSkeleton } from "@/components/charts/ChartSectionSkeleton";
import { AnalyticsDateRangeFilter } from "@/components/analytics/AnalyticsDateRangeFilter";
import { AnalyticsKpiCards } from "@/components/analytics/AnalyticsKpiCards";
import { Alert } from "@/components/Alert";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { getRouteIcon } from "@/config/navigation";
import {
  DEFAULT_ANALYTICS_DATE_RANGE,
  getAnalyticsDateRangeLabel,
  resolveAnalyticsDateRange,
} from "@/lib/analyticsDateRange";
import { downloadAnalyticsPdf, getAnalytics } from "@/services/analytics";
import type { AnalyticsDateRangeValue, AnalyticsResponse } from "@/types/analytics";
import { getAnalyticsErrorMessage, getAnalyticsExportErrorMessage } from "@/utils/analyticsErrors";

const AnalyticsTrendChart = lazy(async () => {
  const module = await import("@/components/analytics/AnalyticsTrendChart");
  return { default: module.AnalyticsTrendChart };
});

const AnalyticsRiskDistributionChart = lazy(async () => {
  const module = await import("@/components/analytics/AnalyticsRiskDistributionChart");
  return { default: module.AnalyticsRiskDistributionChart };
});

export function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<AnalyticsDateRangeValue>(DEFAULT_ANALYTICS_DATE_RANGE);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const queryParams = useMemo(() => resolveAnalyticsDateRange(dateRange), [dateRange]);

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getAnalytics(queryParams);
      startTransition(() => {
        setAnalytics(response);
      });
    } catch (loadError) {
      setAnalytics(null);
      setError(getAnalyticsErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  async function handleExportPdf() {
    setIsExporting(true);
    setExportError(null);
    try {
      await downloadAnalyticsPdf(queryParams);
    } catch (exportFailure) {
      setExportError(getAnalyticsExportErrorMessage(exportFailure));
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <PageShell>
      <PageHeader
        icon={getRouteIcon("/analytics")}
        eyebrow="Population insights"
        title="Population Analytics"
        description="Comprehensive overview of institutional readmission risk, evaluation volume, and population trends."
        meta={<>Showing: {getAnalyticsDateRangeLabel(dateRange)}</>}
        actions={
          <div className="flex flex-col gap-2 sm:items-end">
            <AnalyticsDateRangeFilter
              value={dateRange}
              onChange={setDateRange}
              disabled={isLoading || isExporting}
              className="lg:items-end"
            />
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              disabled={isLoading || isExporting || !analytics}
              onClick={() => void handleExportPdf()}
            >
              <FileDown className="h-4 w-4" aria-hidden />
              {isExporting ? "Exporting PDF…" : "Export PDF"}
            </Button>
          </div>
        }
      />

      {error ? <Alert variant="error">{error}</Alert> : null}
      {exportError ? <Alert variant="error">{exportError}</Alert> : null}

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Spinner label="Loading analytics dashboard" />
        </div>
      ) : analytics ? (
        <>
          <AnalyticsKpiCards summary={analytics.summary} />

          <Suspense fallback={<AnalyticsChartsSkeleton />}>
            <section className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <AnalyticsTrendChart trend={analytics.trend} />
              </div>
              <AnalyticsRiskDistributionChart distribution={analytics.risk_distribution} />
            </section>
          </Suspense>
        </>
      ) : null}
    </PageShell>
  );
}
