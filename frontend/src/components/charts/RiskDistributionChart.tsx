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

export interface RiskDistributionDatum {
  level: string;
  count: number;
  fill: string;
}

interface RiskDistributionChartProps {
  data: RiskDistributionDatum[];
  title?: string;
  description?: string;
}

export function RiskDistributionChart({
  data,
  title = "Risk distribution",
  description = "Population readmission risk buckets (preview data until analytics is wired).",
}: RiskDistributionChartProps) {
  return (
    <ChartContainer title={title} description={description}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e1e3e4" vertical={false} />
          <XAxis
            dataKey="level"
            tick={{ fill: "#414755", fontSize: 12 }}
            axisLine={{ stroke: "#c1c6d7" }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "#414755", fontSize: 12 }}
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
