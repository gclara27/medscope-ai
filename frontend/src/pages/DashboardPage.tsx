import { lazy, startTransition, Suspense, useCallback, useEffect, useState } from "react";

import {
  DashboardHighRiskAlerts,
  DashboardRecentEvaluations,
} from "@/components/dashboard/DashboardActivityPanels";
import { DashboardKpiCards } from "@/components/dashboard/DashboardKpiCards";
import { Alert } from "@/components/Alert";
import { Spinner } from "@/components/Spinner";
import { useAuth } from "@/context/useAuth";
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
      className="flex h-[320px] items-center justify-center rounded-xl border border-outline-variant bg-surface-container-lowest"
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
    <div className="space-y-8 p-4 md:p-8">
      <header>
        <p className="text-sm font-medium uppercase tracking-wide text-primary">
          Clinical overview
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-on-surface md:text-3xl">
          Clinical Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-on-surface-variant">
          Welcome back, {user?.first_name}. Review patient risk overview and recent
          clinical activity (UC-010).
        </p>
      </header>

      {error ? <Alert variant="error">{error}</Alert> : null}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner label="Loading clinical dashboard" />
        </div>
      ) : dashboard ? (
        <>
          <DashboardKpiCards kpis={dashboard.kpis} />

          <section className="grid gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <Suspense fallback={<DashboardChartSkeleton />}>
                <DashboardRiskDistributionChart distribution={dashboard.risk_distribution} />
              </Suspense>
            </div>
            <DashboardHighRiskAlerts alerts={dashboard.high_risk_alerts} />
          </section>

          <DashboardRecentEvaluations items={dashboard.recent_evaluations} />
        </>
      ) : null}
    </div>
  );
}
