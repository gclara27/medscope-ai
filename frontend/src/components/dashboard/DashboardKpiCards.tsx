import type { LucideIcon } from "lucide-react";
import {
  Activity,
  CircleGauge,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import {
  formatDashboardRiskPercent,
  formatEstimatedReadmissionsHint,
  formatRecentEvaluationsHint,
  formatStableConditionHint,
} from "@/lib/dashboardDisplay";
import { cn } from "@/lib/utils";
import type { DashboardKpis } from "@/types/dashboard";

interface DashboardKpiCardsProps {
  kpis: DashboardKpis;
}

type AccentTone = "error" | "primary" | "tertiary" | "risk-low";

interface DashboardKpiCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  hint: string;
  accent: AccentTone;
  valueClassName?: string;
}

const ACCENT_CLASSES: Record<AccentTone, { bar: string; icon: string }> = {
  error: {
    bar: "bg-error",
    icon: "bg-error-container text-on-error-container",
  },
  primary: {
    bar: "bg-primary",
    icon: "bg-primary/10 text-primary",
  },
  tertiary: {
    bar: "bg-tertiary",
    icon: "bg-tertiary-container/20 text-tertiary",
  },
  "risk-low": {
    bar: "bg-risk-low",
    icon: "bg-risk-low/15 text-risk-low",
  },
};

function DashboardKpiCard({
  label,
  value,
  icon: Icon,
  hint,
  accent,
  valueClassName,
}: DashboardKpiCardProps) {
  const accentClasses = ACCENT_CLASSES[accent];

  return (
    <Card className="relative overflow-hidden shadow-level-1">
      <span
        className={cn("absolute inset-y-0 left-0 w-1", accentClasses.bar)}
        aria-hidden
      />
      <CardContent className="flex h-full flex-col justify-between p-5 pl-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
            {label}
          </p>
          <span
            className={cn(
              "inline-flex size-9 shrink-0 items-center justify-center rounded-md",
              accentClasses.icon,
            )}
            aria-hidden
          >
            <Icon className="size-5" strokeWidth={2} />
          </span>
        </div>
        <div>
          <p
            className={cn(
              "font-mono text-3xl font-semibold tabular-nums text-on-surface",
              valueClassName,
            )}
          >
            {value}
          </p>
          <p className="mt-1 text-sm text-on-surface-variant">{hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}

/** Clinical dashboard KPI cards (T-501, RF-011, dashboard mockup). */
export function DashboardKpiCards({ kpis }: DashboardKpiCardsProps) {
  return (
    <section aria-label="Dashboard KPIs" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <DashboardKpiCard
        label="High risk patients"
        value={kpis.high_risk_count.toLocaleString()}
        icon={Activity}
        hint={formatEstimatedReadmissionsHint(kpis)}
        accent="error"
      />
      <DashboardKpiCard
        label="Stable condition"
        value={kpis.low_risk_count.toLocaleString()}
        icon={ShieldCheck}
        hint={formatStableConditionHint(kpis)}
        accent="risk-low"
      />
      <DashboardKpiCard
        label="New evaluations (24h)"
        value={kpis.evaluations_last_24h.toLocaleString()}
        icon={UserPlus}
        hint={formatRecentEvaluationsHint(kpis)}
        accent="tertiary"
      />
      <DashboardKpiCard
        label="Average risk score"
        value={formatDashboardRiskPercent(kpis.average_risk_percent)}
        icon={CircleGauge}
        hint={`${kpis.total_evaluations.toLocaleString()} total evaluations`}
        accent="primary"
        valueClassName="text-primary"
      />
    </section>
  );
}
