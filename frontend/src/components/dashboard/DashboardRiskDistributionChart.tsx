import { ChartContainer } from "@/components/charts/ChartContainer";
import {
  RiskDistributionChart,
  type RiskDistributionDatum,
} from "@/components/charts/RiskDistributionChart";
import {
  getRiskDistributionTotal,
  mapAnalyticsRiskDistribution,
} from "@/lib/analyticsDisplay";
import type { RiskDistributionItem } from "@/types/analytics";

interface DashboardRiskDistributionChartProps {
  distribution: RiskDistributionItem[];
  title?: string;
  description?: string;
}

/** Population risk distribution for the clinical dashboard (T-503, UC-011, RF-011). */
export function DashboardRiskDistributionChart({
  distribution,
  title = "Risk distribution",
  description = "Population readmission risk across low, medium, and high categories (UC-011).",
}: DashboardRiskDistributionChartProps) {
  const data: RiskDistributionDatum[] = mapAnalyticsRiskDistribution(distribution);
  const total = getRiskDistributionTotal(distribution);

  if (total === 0) {
    return (
      <ChartContainer title={title} description={description}>
        <div className="flex h-full items-center justify-center text-sm text-on-surface-variant">
          No evaluations yet. Run a prediction to populate risk distribution.
        </div>
      </ChartContainer>
    );
  }

  return (
    <RiskDistributionChart
      data={data}
      title={title}
      description={`${description} ${total.toLocaleString()} evaluation${total === 1 ? "" : "s"} in scope.`}
    />
  );
}
