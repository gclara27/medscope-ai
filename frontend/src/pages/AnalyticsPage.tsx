import { useCallback, useEffect, useMemo, useState } from "react";

import { AnalyticsDateRangeFilter } from "@/components/analytics/AnalyticsDateRangeFilter";
import { AnalyticsKpiCards } from "@/components/analytics/AnalyticsKpiCards";
import { AnalyticsRiskDistributionChart } from "@/components/analytics/AnalyticsRiskDistributionChart";
import { AnalyticsTrendChart } from "@/components/analytics/AnalyticsTrendChart";
import { Alert } from "@/components/Alert";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Spinner } from "@/components/Spinner";
import { getRouteIcon } from "@/config/navigation";
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
    <PageShell>
      <PageHeader
        icon={getRouteIcon("/analytics")}
        eyebrow="Population insights"
        title="Population Analytics"
        description="Comprehensive overview of institutional readmission risk, evaluation volume, and population trends."
        meta={<>Showing: {getAnalyticsDateRangeLabel(dateRange)}</>}
        actions={
          <AnalyticsDateRangeFilter
            value={dateRange}
            onChange={setDateRange}
            disabled={isLoading}
            className="lg:items-end"
          />
        }
      />

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
    </PageShell>
  );
}
