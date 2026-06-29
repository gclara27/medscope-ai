import { RISK_BADGE_CLASSES, RISK_BADGE_LABELS, clampRiskPercent } from "@/lib/riskDisplay";
import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/types/prediction";

const RISK_BAR_CLASSES: Record<RiskLevel, string> = {
  low: "bg-risk-low",
  medium: "bg-risk-medium",
  high: "bg-risk-high",
};

interface RiskScoreCellProps {
  riskPercent: number;
  riskLevel: RiskLevel;
  className?: string;
  /** `stack` — History table; `inline` — dashboard with mini progress bar. */
  variant?: "stack" | "inline";
}

/** Risk % and level badge — shared across history and dashboard tables (RUX-011). */
export function RiskScoreCell({
  riskPercent,
  riskLevel,
  className,
  variant = "stack",
}: RiskScoreCellProps) {
  const percentLabel = (
    <span className="font-semibold tabular-nums">{riskPercent.toFixed(1)}%</span>
  );
  const badge = (
    <span
      className={cn(
        "inline-flex w-fit rounded-md px-2 py-0.5 text-xs font-semibold",
        RISK_BADGE_CLASSES[riskLevel],
      )}
    >
      {RISK_BADGE_LABELS[riskLevel]}
    </span>
  );

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div
          className="h-2 w-16 shrink-0 overflow-hidden rounded-full bg-surface-container-high"
          aria-hidden
        >
          <div
            className={cn("h-full rounded-full", RISK_BAR_CLASSES[riskLevel])}
            style={{ width: `${clampRiskPercent(riskPercent)}%` }}
          />
        </div>
        {percentLabel}
        {badge}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {percentLabel}
      {badge}
    </div>
  );
}