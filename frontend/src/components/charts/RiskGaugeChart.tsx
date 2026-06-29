import { cn } from "@/lib/utils";
import {
  RISK_BADGE_CLASSES,
  RISK_BADGE_LABELS,
  RISK_TEXT_CLASSES,
  clampRiskPercent,
} from "@/lib/riskDisplay";
import { useChartColors } from "@/hooks/useChartColors";
import type { RiskLevel } from "@/types/prediction";
import type { ReactNode } from "react";

const GAUGE_RADIUS = 40;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;

interface RiskGaugeChartProps {
  riskPercent: number;
  riskLevel: RiskLevel;
  title?: ReactNode;
  titleClassName?: string;
  className?: string;
}

/** Semicircular donut gauge for readmission risk (RFW-021, RF-023). */
export function RiskGaugeChart({
  riskPercent,
  riskLevel,
  title = "30-Day Readmission Risk",
  titleClassName,
  className,
}: RiskGaugeChartProps) {
  const colors = useChartColors();
  const percent = clampRiskPercent(riskPercent);
  const strokeColor = colors[riskLevel];
  const dashOffset = GAUGE_CIRCUMFERENCE * (1 - percent / 100);
  const gaugeLabel = `Readmission risk ${percent.toFixed(1)} percent, ${RISK_BADGE_LABELS[riskLevel]}`;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <h3
        className={cn(
          "mb-4 w-full border-b border-outline-variant pb-2 text-center text-sm font-semibold uppercase tracking-wide text-on-surface-variant",
          titleClassName,
        )}
      >
        {title}
      </h3>

      <div
        className="relative flex h-44 w-44 items-center justify-center"
        role="img"
        aria-label={gaugeLabel}
      >
        <svg
          className="h-full w-full -rotate-90"
          viewBox="0 0 100 100"
          aria-hidden
        >
          <circle
            cx="50"
            cy="50"
            r={GAUGE_RADIUS}
            fill="transparent"
            stroke={colors.gaugeTrack}
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r={GAUGE_RADIUS}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={GAUGE_CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <span
            className={cn(
              "text-4xl font-bold tabular-nums leading-none",
              RISK_TEXT_CLASSES[riskLevel],
            )}
          >
            {percent.toFixed(1)}
            <span className="text-2xl">%</span>
          </span>
          <span
            className={cn(
              "mt-2 rounded-full px-3 py-0.5 text-xs font-semibold uppercase tracking-wide",
              RISK_BADGE_CLASSES[riskLevel],
            )}
          >
            {RISK_BADGE_LABELS[riskLevel]}
          </span>
        </div>
      </div>
    </div>
  );
}
