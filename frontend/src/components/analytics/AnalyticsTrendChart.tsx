import { useMemo } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartContainer } from "@/components/charts/ChartContainer";
import { ChartTooltipCard } from "@/components/charts/ChartTooltipCard";
import { useChartColors } from "@/hooks/useChartColors";
import { mapAnalyticsTrendPoints } from "@/lib/analyticsDisplay";
import { getBarHighlightFill, getRechartsLegendStyle } from "@/lib/chartTheme";
import type { TrendPoint } from "@/types/analytics";

interface AnalyticsTrendChartProps {
  trend: TrendPoint[];
  title?: string;
  description?: string;
}

/** Daily volume and average risk trend from GET /analytics (T-605, UC-061). */
export function AnalyticsTrendChart({
  trend,
  title = "Prediction volume and average risk",
  description = "Daily evaluation count and average readmission risk for the selected period.",
}: AnalyticsTrendChartProps) {
  const colors = useChartColors();
  const data = mapAnalyticsTrendPoints(trend);
  const barHighlightFill = useMemo(() => getBarHighlightFill(colors), [colors]);
  const legendStyle = useMemo(() => getRechartsLegendStyle(colors), [colors]);

  if (data.length === 0) {
    return (
      <ChartContainer title={title} description={description}>
        <div className="flex h-full items-center justify-center text-sm text-on-surface-variant">
          No trend data in the selected period.
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer title={title} description={description}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: colors.axis, fontSize: 12 }}
            axisLine={{ stroke: colors.outline }}
            tickLine={false}
          />
          <YAxis
            yAxisId="count"
            allowDecimals={false}
            tick={{ fill: colors.axis, fontSize: 12 }}
            axisLine={{ stroke: colors.outline }}
            tickLine={false}
          />
          <YAxis
            yAxisId="risk"
            orientation="right"
            domain={[0, 100]}
            tick={{ fill: colors.axis, fontSize: 12 }}
            axisLine={{ stroke: colors.outline }}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: barHighlightFill }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) {
                return null;
              }

              return (
                <ChartTooltipCard
                  title={label ? String(label) : undefined}
                  rows={payload.map((entry) => ({
                    label: String(entry.name ?? "Value"),
                    value: String(entry.value ?? ""),
                    color: typeof entry.color === "string" ? entry.color : undefined,
                  }))}
                />
              );
            }}
          />
          <Legend wrapperStyle={legendStyle} />
          <Bar
            yAxisId="count"
            dataKey="count"
            name="Evaluations"
            fill={colors.primary}
            radius={[4, 4, 0, 0]}
          />
          <Line
            yAxisId="risk"
            type="monotone"
            dataKey="averageRiskPercent"
            name="Avg risk %"
            stroke={colors.teal}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
