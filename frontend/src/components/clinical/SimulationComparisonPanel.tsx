import { FlaskConical, Minus, TrendingDown, TrendingUp } from "lucide-react";

import { RiskGaugeChart } from "@/components/charts/RiskGaugeChart";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatRiskDelta,
  formatRiskDeltaWithLevel,
  riskDeltaDirection,
} from "@/lib/simulationDisplay";
import { RISK_LABELS } from "@/lib/riskDisplay";
import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/types/prediction";

interface RiskSnapshot {
  risk_percent: number;
  risk_level: RiskLevel;
}

interface SimulationComparisonPanelProps {
  originalRisk: RiskSnapshot;
  simulatedRisk: RiskSnapshot;
  delta?: number;
  isRecalculating?: boolean;
  hasSimulationResult?: boolean;
  simulatedAnimateFromPercent?: number;
  simulationAnimationKey?: string;
}

function DeltaBadge({ delta, riskLevel }: { delta: number; riskLevel: RiskLevel }) {
  const direction = riskDeltaDirection(delta);
  const Icon =
    direction === "up" ? TrendingUp : direction === "down" ? TrendingDown : Minus;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold",
        direction === "up" && "border-risk-high/30 bg-risk-high/10 text-risk-high",
        direction === "down" && "border-risk-low/30 bg-risk-low/10 text-risk-low",
        direction === "unchanged" &&
          "border-outline-variant bg-surface-container-low text-on-surface-variant",
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {formatRiskDeltaWithLevel(delta, riskLevel)}
    </div>
  );
}

/** Side-by-side baseline vs simulated risk (T-522, RF-042, UC-043). */
export function SimulationComparisonPanel({
  originalRisk,
  simulatedRisk,
  delta,
  isRecalculating = false,
  hasSimulationResult = false,
  simulatedAnimateFromPercent,
  simulationAnimationKey,
}: SimulationComparisonPanelProps) {
  const showDelta = hasSimulationResult && delta !== undefined;

  return (
    <section
      aria-label="Risk comparison"
      className="flex flex-col gap-4"
    >
      {showDelta ? (
        <div
          className="grid grid-cols-3 gap-3 rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 text-center text-sm"
          aria-label="Risk comparison summary"
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
              Original
            </p>
            <p className="mt-1 font-mono text-lg font-semibold text-on-surface">
              {originalRisk.risk_percent.toFixed(1)}%
            </p>
            <p className="text-xs text-on-surface-variant">{RISK_LABELS[originalRisk.risk_level]}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
              Simulated
            </p>
            <p className="mt-1 font-mono text-lg font-semibold text-primary">
              {simulatedRisk.risk_percent.toFixed(1)}%
            </p>
            <p className="text-xs text-on-surface-variant">
              {RISK_LABELS[simulatedRisk.risk_level]}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
              Difference
            </p>
            <p
              className={cn(
                "mt-1 font-mono text-lg font-semibold",
                riskDeltaDirection(delta) === "up" && "text-risk-high",
                riskDeltaDirection(delta) === "down" && "text-risk-low",
                riskDeltaDirection(delta) === "unchanged" && "text-on-surface-variant",
              )}
            >
              {formatRiskDelta(delta)}
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="relative overflow-hidden">
          <div
            aria-hidden
            className="absolute left-0 top-0 h-full w-1 bg-outline-variant"
          />
          <CardContent className="p-6">
            <RiskGaugeChart
              riskPercent={originalRisk.risk_percent}
              riskLevel={originalRisk.risk_level}
              title="Baseline risk score"
            />
          </CardContent>
        </Card>

        <Card
          className={cn(
            "relative overflow-hidden",
            hasSimulationResult && "border-primary ring-1 ring-primary/20",
          )}
          aria-busy={isRecalculating}
        >
          <div
            aria-hidden
            className={cn(
              "absolute left-0 top-0 h-full w-1",
              hasSimulationResult ? "bg-primary" : "bg-outline-variant",
            )}
          />
          <CardContent className="relative p-6">
            <RiskGaugeChart
              riskPercent={simulatedRisk.risk_percent}
              riskLevel={simulatedRisk.risk_level}
              animateFromPercent={simulatedAnimateFromPercent}
              animationKey={simulationAnimationKey}
              title={
                <span className="inline-flex items-center justify-center gap-1.5">
                  {hasSimulationResult ? (
                    <FlaskConical className="h-4 w-4 text-primary" aria-hidden />
                  ) : null}
                  Simulated risk score
                </span>
              }
              titleClassName={hasSimulationResult ? "text-primary" : undefined}
            />

            {showDelta ? (
              <div className="mt-2 flex justify-center">
                <DeltaBadge delta={delta} riskLevel={simulatedRisk.risk_level} />
              </div>
            ) : (
              <p className="mt-2 text-center text-sm text-on-surface-variant">
                Adjust variables and recalculate to compare simulated risk.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
