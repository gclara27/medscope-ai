import { lazy, startTransition, Suspense, useCallback, useEffect, useState } from "react";

import {
  DashboardHighRiskAlerts,
  DashboardRecentEvaluations,
} from "@/components/dashboard/DashboardActivityPanels";
import { DashboardKpiCards } from "@/components/dashboard/DashboardKpiCards";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Alert } from "@/components/Alert";
import { Spinner } from "@/components/Spinner";
import { getRouteIcon } from "@/config/navigation";
import { useAuth } from "@/context/useAuth";
import { DASHBOARD_CHART_ROW_HEIGHT_CLASS } from "@/lib/dashboardLayout";
import { cn } from "@/lib/utils";
import { getDashboard } from "@/services/dashboard";
import type { DashboardResponse } from "@/types/dashboard";
import { getDashboardErrorMessage } from "@/utils/dashboardErrors";

const DashboardRiskDistributionChart = lazy(async () => {
  const module = await import("@/components/dashboard/DashboardRiskDistributionChart");
  return { default: module.DashboardRiskDistributionChart };
});

function DashboardChartSkeleton() {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl border border-outline-variant bg-surface-container-lowest",
        DASHBOARD_CHART_ROW_HEIGHT_CLASS,
      )}
      aria-hidden
    >
      <Spinner label="Loading risk distribution chart" />
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getDashboard();
      startTransition(() => {
        setDashboard(response);
      });
    } catch (loadError) {
      setDashboard(null);
      setError(getDashboardErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  return (
    <PageShell>
      <PageHeader
        icon={getRouteIcon("/dashboard")}
        eyebrow="Clinical overview"
        title="Clinical Dashboard"
        description={`Welcome back, ${user?.first_name}. Review patient risk overview and recent clinical activity.`}
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner label="Loading clinical dashboard" />
        </div>
      ) : dashboard ? (
        <>
          <DashboardKpiCards kpis={dashboard.kpis} />

          <div className="space-y-4">
            <section className="grid gap-4 xl:grid-cols-3 xl:items-start">
              <div className="xl:col-span-2">
                <Suspense fallback={<DashboardChartSkeleton />}>
                  <DashboardRiskDistributionChart distribution={dashboard.risk_distribution} />
                </Suspense>
              </div>
              <DashboardHighRiskAlerts alerts={dashboard.high_risk_alerts} />
            </section>

            <DashboardRecentEvaluations items={dashboard.recent_evaluations} />
          </div>
        </>
      ) : null}
    </PageShell>
  );
}
