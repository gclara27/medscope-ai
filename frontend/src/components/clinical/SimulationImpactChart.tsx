import { BarChart3 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import {
  formatImpactPoints,
  type SimulationImpactRow,
} from "@/lib/simulationImpact";
import { cn } from "@/lib/utils";

interface SimulationImpactChartProps {
  rows: SimulationImpactRow[];
  className?: string;
}

const MIN_BAR_HEIGHT_PX = 28;
const MAX_BAR_HEIGHT_PX = 120;

function barHeightPx(barHeightPercent: number): number {
  const ratio = Math.max(barHeightPercent, 8) / 100;
  return Math.round(MIN_BAR_HEIGHT_PX + ratio * (MAX_BAR_HEIGHT_PX - MIN_BAR_HEIGHT_PX));
}

/** Waterfall-style driver impact chart for simulation (T-524, RF-043, UC-043). */
export function SimulationImpactChart({ rows, className }: SimulationImpactChartProps) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <Card className={cn("flex min-h-[300px] flex-col", className)}>
      <div className="flex items-center justify-between rounded-t-lg border-b border-outline-variant bg-surface-container-lowest px-6 py-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-on-surface">
          <BarChart3 className="h-[18px] w-[18px] text-secondary" aria-hidden />
          Driver impact analysis
        </h2>
        <div className="flex flex-wrap gap-3 text-xs font-medium text-on-surface-variant">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-risk-low" aria-hidden />
            Lower risk
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-risk-high" aria-hidden />
            Higher risk
          </span>
        </div>
      </div>

      <CardContent className="relative flex flex-1 flex-col justify-center p-6">
        <div
          className="pointer-events-none absolute bottom-[5.5rem] left-6 right-6 border-b border-outline-variant"
          aria-hidden
        />

        <div
          role="img"
          aria-label="Driver impact waterfall chart"
          className="mx-auto flex w-full max-w-2xl items-end justify-between gap-2 px-2 py-4 sm:gap-3 sm:px-4"
        >
          {rows.map((row) => {
            const decreasesRisk = row.impactPoints < 0;
            const increasesRisk = row.impactPoints > 0;
            const height = barHeightPx(row.barHeightPercent);

            return (
              <div
                key={row.fieldKey}
                className="group flex w-full min-w-0 flex-col items-center gap-2"
                title={`${row.label}: ${formatImpactPoints(row.impactPoints)} pts`}
              >
                {decreasesRisk ? (
                  <span className="font-mono text-xs font-semibold text-risk-low">
                    {formatImpactPoints(row.impactPoints)}
                  </span>
                ) : null}

                <div
                  className={cn(
                    "relative w-full overflow-hidden rounded-t border border-outline-variant",
                    decreasesRisk && "border-risk-low/40 bg-risk-low/10",
                    increasesRisk && "border-risk-high/40 bg-risk-high/10",
                    !decreasesRisk && !increasesRisk && "bg-surface-container-low",
                  )}
                  style={{ height: `${height}px` }}
                >
                  <div
                    aria-hidden
                    className={cn(
                      "absolute bottom-0 h-full w-full",
                      decreasesRisk && "bg-risk-low/25",
                      increasesRisk && "bg-risk-high/20",
                    )}
                  />
                </div>

                {increasesRisk ? (
                  <span className="font-mono text-xs font-semibold text-risk-high">
                    {formatImpactPoints(row.impactPoints)}
                  </span>
                ) : null}

                <p className="text-center text-xs leading-tight text-on-surface-variant">
                  {row.label}
                </p>
              </div>
            );
          })}
        </div>

        <p className="mt-2 text-center text-xs text-on-surface-variant">
          Estimated contribution per changed variable, scaled to the total risk delta.
        </p>
      </CardContent>
    </Card>
  );
}
