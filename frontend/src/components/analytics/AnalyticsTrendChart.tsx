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
import { mapAnalyticsTrendPoints } from "@/lib/analyticsDisplay";
import { CHART_COLORS } from "@/lib/recharts";
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
  const data = mapAnalyticsTrendPoints(trend);

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
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
            axisLine={{ stroke: "#c1c6d7" }}
            tickLine={false}
          />
          <YAxis
            yAxisId="count"
            allowDecimals={false}
            tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
            axisLine={{ stroke: "#c1c6d7" }}
            tickLine={false}
          />
          <YAxis
            yAxisId="risk"
            orientation="right"
            domain={[0, 100]}
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
          />
          <Legend />
          <Bar
            yAxisId="count"
            dataKey="count"
            name="Evaluations"
            fill={CHART_COLORS.primary}
            radius={[4, 4, 0, 0]}
          />
          <Line
            yAxisId="risk"
            type="monotone"
            dataKey="averageRiskPercent"
            name="Avg risk %"
            stroke="#0d9488"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
