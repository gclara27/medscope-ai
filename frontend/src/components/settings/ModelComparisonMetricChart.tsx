import { useMemo } from "react";
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
import { ChartTooltipCard } from "@/components/charts/ChartTooltipCard";
import { useChartColors } from "@/hooks/useChartColors";
import {
  formatPrimaryMetricLabel,
  mapModelComparisonChartData,
} from "@/lib/mlComparisonDisplay";
import { getBarHighlightFill } from "@/lib/chartTheme";
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
  const colors = useChartColors();
  const data = useMemo(
    () => mapModelComparisonChartData(models, primaryMetric, productionModelId, colors),
    [colors, models, primaryMetric, productionModelId],
  );
  const barHighlightFill = useMemo(() => getBarHighlightFill(colors), [colors]);
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
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
          <XAxis
            dataKey="model"
            tick={{ fill: colors.axis, fontSize: 12 }}
            axisLine={{ stroke: colors.outline }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            tick={{ fill: colors.axis, fontSize: 12 }}
            axisLine={{ stroke: colors.outline }}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: barHighlightFill }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length || !label) {
                return null;
              }

              const datum = payload[0]?.payload as (typeof data)[number] | undefined;
              const rawValue = payload[0]?.value;
              const numericValue =
                typeof rawValue === "number" ? rawValue : Number(rawValue ?? 0);
              const productionLabel = datum?.isProduction ? " (production)" : "";

              return (
                <ChartTooltipCard
                  title={String(label)}
                  rows={[
                    {
                      label: `${metricLabel}${productionLabel}`,
                      value: `${numericValue.toFixed(1)}%`,
                      color: datum?.fill,
                    },
                  ]}
                />
              );
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
