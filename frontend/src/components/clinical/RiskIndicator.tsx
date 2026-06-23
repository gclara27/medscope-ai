import { AlertTriangle, ShieldCheck, ShieldAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import { RISK_LABELS, RISK_RECOMMENDATIONS, RISK_STYLES } from "@/lib/riskDisplay";
import type { RiskLevel } from "@/types/prediction";

const RISK_ICONS = {
  low: ShieldCheck,
  medium: ShieldAlert,
  high: AlertTriangle,
} as const;

interface RiskIndicatorProps {
  riskLevel: RiskLevel;
  recommendation?: string;
  className?: string;
}

/** Clinical risk category badge with optional guidance (RFW-022, RF-023). */
export function RiskIndicator({
  riskLevel,
  recommendation,
  className,
}: RiskIndicatorProps) {
  const Icon = RISK_ICONS[riskLevel];
  const message = recommendation ?? RISK_RECOMMENDATIONS[riskLevel];

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        RISK_STYLES[riskLevel],
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
        <div>
          <p className="text-sm font-semibold text-on-surface">
            {RISK_LABELS[riskLevel]}
          </p>
          <p className="mt-1 text-sm text-on-surface-variant">{message}</p>
        </div>
      </div>
    </div>
  );
}
