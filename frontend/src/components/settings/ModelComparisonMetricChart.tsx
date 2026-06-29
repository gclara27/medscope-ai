import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartContainer } from "@/components/charts/ChartContainer";
import {
  formatPrimaryMetricLabel,
  mapModelComparisonChartData,
} from "@/lib/mlComparisonDisplay";
import { CHART_COLORS } from "@/lib/recharts";
import type { ModelComparisonItem } from "@/types/mlComparison";

interface ModelComparisonMetricChartProps {
  models: ModelComparisonItem[];
  primaryMetric: string;
  productionModelId: string | null;
}

/** Offline model metric bar chart for Settings → Models (T-X07-05, RIA-041). */
export function ModelComparisonMetricChart({
  models,
  primaryMetric,
  productionModelId,
}: ModelComparisonMetricChartProps) {
  const data = mapModelComparisonChartData(models, primaryMetric, productionModelId);
  const metricLabel = formatPrimaryMetricLabel(primaryMetric);
  const title = `${metricLabel} comparison`;
  const description = `Offline ${metricLabel.toLowerCase()} by candidate model on the validation split. The production model is highlighted in blue.`;

  if (data.length === 0) {
    return (
      <ChartContainer title={title} description={description}>
        <div className="flex h-full items-center justify-center text-sm text-on-surface-variant">
          No chart data available for evaluated models.
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer title={title} description={description}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
          <XAxis
            dataKey="model"
            tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
            axisLine={{ stroke: "#c1c6d7" }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
            axisLine={{ stroke: "#c1c6d7" }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #c1c6d7",
              fontSize: "13px",
            }}
            formatter={(value, _name, item) => {
              const numericValue = typeof value === "number" ? value : Number(value ?? 0);
              const productionLabel = item.payload?.isProduction ? " (production)" : "";
              return [`${numericValue.toFixed(1)}%`, `${metricLabel}${productionLabel}`];
            }}
          />
          <Bar dataKey="metricPercent" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.model} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
