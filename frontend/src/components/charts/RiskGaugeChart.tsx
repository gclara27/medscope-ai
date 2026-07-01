import { useEffect, useRef, useState, type ReactNode } from "react";

import { useChartColors } from "@/hooks/useChartColors";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { easeOutCubic } from "@/lib/motion";
import {
  RISK_BADGE_CLASSES,
  RISK_BADGE_LABELS,
  RISK_TEXT_CLASSES,
  clampRiskPercent,
} from "@/lib/riskDisplay";
import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/types/prediction";

const GAUGE_RADIUS = 40;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;
const DEFAULT_ANIMATION_DURATION_MS = 800;

interface RiskGaugeChartProps {
  riskPercent: number;
  riskLevel: RiskLevel;
  title?: ReactNode;
  titleClassName?: string;
  className?: string;
  /** When set, animates arc and label from this percent to `riskPercent` (T-908-01). */
  animateFromPercent?: number;
  animationDurationMs?: number;
  /** Bumps animation when simulation recalculates (e.g. simulate response id). */
  animationKey?: string;
}

/** Semicircular donut gauge for readmission risk (RFW-021, RF-023, T-908). */
export function RiskGaugeChart({
  riskPercent,
  riskLevel,
  title = "30-Day Readmission Risk",
  titleClassName,
  className,
  animateFromPercent,
  animationDurationMs = DEFAULT_ANIMATION_DURATION_MS,
  animationKey,
}: RiskGaugeChartProps) {
  const colors = useChartColors();
  const reducedMotion = usePrefersReducedMotion();
  const targetPercent = clampRiskPercent(riskPercent);
  const [displayPercent, setDisplayPercent] = useState(targetPercent);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    const to = targetPercent;
    const from =
      animateFromPercent !== undefined ? clampRiskPercent(animateFromPercent) : to;

    if (reducedMotion || Math.abs(from - to) < 0.05) {
      setDisplayPercent(to);
      return undefined;
    }

    setDisplayPercent(from);
    const start = performance.now();

    const step = (now: number) => {
      const progress = easeOutCubic((now - start) / animationDurationMs);
      const next = from + (to - from) * progress;
      setDisplayPercent(next);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(step);
      } else {
        setDisplayPercent(to);
        animationFrameRef.current = null;
      }
    };

    animationFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [
    targetPercent,
    animateFromPercent,
    animationDurationMs,
    reducedMotion,
    animationKey,
  ]);

  const strokeColor = colors[riskLevel];
  const dashOffset = GAUGE_CIRCUMFERENCE * (1 - displayPercent / 100);
  const gaugeLabel = `Readmission risk ${targetPercent.toFixed(1)} percent, ${RISK_BADGE_LABELS[riskLevel]}`;

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
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden>
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
            className={cn(!reducedMotion && "transition-[stroke] duration-300 ease-out")}
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <span
            className={cn(
              "text-4xl font-bold tabular-nums leading-none",
              RISK_TEXT_CLASSES[riskLevel],
            )}
          >
            {displayPercent.toFixed(1)}
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
