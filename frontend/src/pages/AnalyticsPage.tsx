import { BarChart3 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AnalyticsDateRangeFilter } from "@/components/analytics/AnalyticsDateRangeFilter";
import { AnalyticsKpiCards } from "@/components/analytics/AnalyticsKpiCards";
import { AnalyticsRiskDistributionChart } from "@/components/analytics/AnalyticsRiskDistributionChart";
import { AnalyticsTrendChart } from "@/components/analytics/AnalyticsTrendChart";
import { Alert } from "@/components/Alert";
import { Spinner } from "@/components/Spinner";
import {
  DEFAULT_ANALYTICS_DATE_RANGE,
  getAnalyticsDateRangeLabel,
  resolveAnalyticsDateRange,
} from "@/lib/analyticsDateRange";
import { getAnalytics } from "@/services/analytics";
import type { AnalyticsDateRangeValue, AnalyticsResponse } from "@/types/analytics";
import { getAnalyticsErrorMessage } from "@/utils/analyticsErrors";

export function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<AnalyticsDateRangeValue>(DEFAULT_ANALYTICS_DATE_RANGE);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryParams = useMemo(() => resolveAnalyticsDateRange(dateRange), [dateRange]);

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getAnalytics(queryParams);
      setAnalytics(response);
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

  return (
    <div className="space-y-8 p-4 md:p-8">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-primary">
            Population insights
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold text-on-surface md:text-3xl">
            <BarChart3 className="h-7 w-7 text-primary" aria-hidden />
            Population Analytics
          </h1>
          <p className="mt-2 max-w-2xl text-on-surface-variant">
            Comprehensive overview of institutional readmission risk, evaluation volume, and
            population trends (UC-060, RF-060).
          </p>
          <p className="mt-2 text-sm text-on-surface-variant">
            Showing: {getAnalyticsDateRangeLabel(dateRange)}
          </p>
        </div>
        <AnalyticsDateRangeFilter
          value={dateRange}
          onChange={setDateRange}
          disabled={isLoading}
          className="lg:items-end"
        />
      </header>

      {error ? <Alert variant="error">{error}</Alert> : null}

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Spinner label="Loading analytics dashboard" />
        </div>
      ) : analytics ? (
        <>
          <AnalyticsKpiCards summary={analytics.summary} />

          <section className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <AnalyticsTrendChart trend={analytics.trend} />
            </div>
            <AnalyticsRiskDistributionChart distribution={analytics.risk_distribution} />
          </section>
        </>
      ) : null}
    </div>
  );
}
