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
import { getBarHighlightFill } from "@/lib/chartTheme";

export interface RiskDistributionDatum {
  level: string;
  count: number;
  fill: string;
  percentage?: number;
}

interface RiskDistributionChartProps {
  data: RiskDistributionDatum[];
  title?: string;
  description?: string;
}

export function RiskDistributionChart({
  data,
  title = "Risk distribution",
  description = "Population readmission risk buckets.",
}: RiskDistributionChartProps) {
  const colors = useChartColors();
  const barHighlightFill = useMemo(() => getBarHighlightFill(colors), [colors]);

  return (
    <ChartContainer title={title} description={description}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
          <XAxis
            dataKey="level"
            tick={{ fill: colors.axis, fontSize: 12 }}
            axisLine={{ stroke: colors.outline }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
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

              const datum = payload[0]?.payload as RiskDistributionDatum | undefined;
              const rawValue = payload[0]?.value;
              const numericValue =
                typeof rawValue === "number" ? rawValue : Number(rawValue ?? 0);
              const percentage = datum?.percentage;
              const valueText =
                typeof percentage === "number"
                  ? `${numericValue} (${percentage.toFixed(1)}%)`
                  : String(numericValue);

              return (
                <ChartTooltipCard
                  title={String(label)}
                  rows={[
                    {
                      label: "Evaluations",
                      value: valueText,
                      color: datum?.fill,
                    },
                  ]}
                />
              );
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.level} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
