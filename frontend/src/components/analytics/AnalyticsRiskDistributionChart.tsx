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

interface AnalyticsRiskDistributionChartProps {
  distribution: RiskDistributionItem[];
  title?: string;
  description?: string;
}

/** Risk category bar chart wired to GET /analytics risk_distribution (T-606, UC-062). */
export function AnalyticsRiskDistributionChart({
  distribution,
  title = "Risk distribution",
  description = "Population readmission risk buckets for the selected period.",
}: AnalyticsRiskDistributionChartProps) {
  const data: RiskDistributionDatum[] = mapAnalyticsRiskDistribution(distribution);
  const total = getRiskDistributionTotal(distribution);

  if (total === 0) {
    return (
      <ChartContainer title={title} description={description}>
        <div className="flex h-full items-center justify-center text-sm text-on-surface-variant">
          No predictions in the selected period.
        </div>
      </ChartContainer>
    );
  }

  return <RiskDistributionChart data={data} title={title} description={description} />;
}
