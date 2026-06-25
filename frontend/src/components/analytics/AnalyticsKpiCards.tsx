import type { LucideIcon } from "lucide-react";
import { Activity, CircleGauge, Clock, ListChecks } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import {
  formatAverageRiskPercent,
  formatPredictionLatencyMs,
  formatRiskMix,
  getDominantRiskLevel,
} from "@/lib/analyticsDisplay";
import { RISK_BADGE_CLASSES, RISK_LABELS } from "@/lib/riskDisplay";
import { cn } from "@/lib/utils";
import type { AnalyticsSummary } from "@/types/analytics";

interface AnalyticsKpiCardsProps {
  summary: AnalyticsSummary;
}

interface KpiCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  hintClassName?: string;
}

const KPI_ICON_TILE_SIZE = "size-10";
const KPI_ICON_SIZE = 16;

function KpiCardIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-visible rounded-lg bg-primary/10 text-primary",
        KPI_ICON_TILE_SIZE,
      )}
      aria-hidden
    >
      <Icon size={KPI_ICON_SIZE} strokeWidth={2} className="block overflow-visible" />
    </span>
  );
}

function KpiCard({ label, value, icon, hint, hintClassName }: KpiCardProps) {
  return (
    <Card className="shadow-level-1">
      <CardContent className="p-5">
        <div className="mb-3 flex items-center gap-3">
          <KpiCardIcon icon={icon} />
          <p className="min-w-0 flex-1 text-xs font-semibold uppercase leading-tight tracking-wide text-on-surface-variant">
            {label}
          </p>
        </div>
        <div className="flex items-end justify-between gap-3">
          <p className="font-mono text-2xl font-semibold tabular-nums text-on-surface">{value}</p>
          {hint ? (
            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
                hintClassName,
              )}
            >
              {hint}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

/** Executive KPI cards from GET /analytics summary (T-608, RF-062). */
export function AnalyticsKpiCards({ summary }: AnalyticsKpiCardsProps) {
  const dominantRisk = getDominantRiskLevel(summary);

  return (
    <section aria-label="Analytics KPIs" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="Total evaluations"
        value={summary.total_predictions.toLocaleString()}
        icon={ListChecks}
        hint={summary.total_predictions > 0 ? "Stored predictions" : "No data yet"}
        hintClassName="bg-surface-container-low text-on-surface-variant"
      />
      <KpiCard
        label="Average risk score"
        value={formatAverageRiskPercent(summary.average_risk_percent)}
        icon={CircleGauge}
        hint={dominantRisk ? RISK_LABELS[dominantRisk] : "Awaiting data"}
        hintClassName={
          dominantRisk ? RISK_BADGE_CLASSES[dominantRisk] : "bg-surface-container-low text-on-surface-variant"
        }
      />
      <KpiCard
        label="High risk evaluations"
        value={summary.high_risk_count.toLocaleString()}
        icon={Activity}
        hint={formatRiskMix(summary)}
        hintClassName="bg-surface-container-low text-on-surface-variant"
      />
      <KpiCard
        label="Avg inference time"
        value={formatPredictionLatencyMs(summary.average_prediction_time_ms)}
        icon={Clock}
        hint={summary.average_prediction_time_ms != null ? "Model latency" : "Not recorded"}
        hintClassName="bg-primary/10 text-primary"
      />
    </section>
  );
}
