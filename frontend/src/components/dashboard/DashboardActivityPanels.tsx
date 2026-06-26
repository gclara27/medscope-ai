import { Activity, AlertTriangle, Eye } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatAlertSummary,
  formatEvaluationReference,
  formatRelativeEvaluationTime,
} from "@/lib/dashboardActivityDisplay";
import { DASHBOARD_CHART_ROW_HEIGHT_CLASS } from "@/lib/dashboardLayout";
import { formatPatientSnapshot } from "@/lib/historyDisplay";
import { RISK_BADGE_CLASSES, RISK_BADGE_LABELS } from "@/lib/riskDisplay";
import { cn } from "@/lib/utils";
import type { HistoryListItem } from "@/types/history";

const detailLinkClassName =
  "text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

function historyDetailPath(predictionId: string): string {
  return `/history/${predictionId}`;
}

interface DashboardHighRiskAlertsProps {
  alerts: HistoryListItem[];
}

/** High-risk alert feed for the clinical dashboard (T-502, RF-010). */
export function DashboardHighRiskAlerts({ alerts }: DashboardHighRiskAlertsProps) {
  return (
    <Card
      className={cn(
        "flex flex-col overflow-hidden shadow-level-1",
        DASHBOARD_CHART_ROW_HEIGHT_CLASS,
      )}
    >
      <CardHeader className="shrink-0 border-b border-outline-variant bg-error-container/10">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="size-5 text-error" aria-hidden />
            Critical alerts
          </CardTitle>
          {alerts.length > 0 ? (
            <span className="rounded-full bg-error px-2.5 py-0.5 text-xs font-semibold text-on-primary">
              {alerts.length} active
            </span>
          ) : null}
        </div>
        <CardDescription>Recent high-risk evaluations requiring review</CardDescription>
      </CardHeader>
      <CardContent
        className="min-h-0 flex-1 overflow-y-auto p-4"
        aria-label="Critical alerts list"
        tabIndex={alerts.length > 0 ? 0 : undefined}
      >
        {alerts.length === 0 ? (
          <p className="text-sm text-on-surface-variant">
            No high-risk alerts right now. New critical evaluations will appear here.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {alerts.map((alert) => (
              <article
                key={alert.id}
                className="rounded-lg border border-error-container bg-error-container/20 p-3"
              >
                <div className="flex gap-3">
                  <Activity className="mt-0.5 size-4 shrink-0 text-error" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <Link
                        to={historyDetailPath(alert.id)}
                        className={cn("font-mono text-sm font-semibold", detailLinkClassName)}
                      >
                        {formatEvaluationReference(alert.id)}
                      </Link>
                      <span className="text-xs font-medium text-error">
                        {formatRelativeEvaluationTime(alert.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant">
                      {formatAlertSummary(alert.summary, alert.risk_percent)}
                    </p>
                    <p className="mt-1 text-xs text-on-surface-variant">
                      {formatPatientSnapshot(alert.patient_input)}
                    </p>
                    <Link
                      to={historyDetailPath(alert.id)}
                      className={cn("mt-2 inline-flex text-sm font-medium", detailLinkClassName)}
                    >
                      Review evaluation
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface DashboardRecentEvaluationsProps {
  items: HistoryListItem[];
}

/** Recent evaluations table for the clinical dashboard (T-502, UC-010). */
export function DashboardRecentEvaluations({ items }: DashboardRecentEvaluationsProps) {
  return (
    <Card className="shadow-level-1">
      <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-outline-variant">
        <div>
          <CardTitle className="text-base">Recent AI evaluations</CardTitle>
          <CardDescription>Latest stored prediction activity</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild className="shrink-0 text-primary">
          <Link to="/history">View full log</Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {items.length === 0 ? (
          <p className="p-6 text-sm text-on-surface-variant">
            No evaluations yet. Run a prediction from Evaluation to populate this feed.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                  <th className="px-4 py-3 font-medium">Evaluation</th>
                  <th className="px-4 py-3 font-medium">Patient snapshot</th>
                  <th className="px-4 py-3 font-medium">Risk score</th>
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">
                    <span className="sr-only">View evaluation</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-outline-variant/70 transition-colors hover:bg-surface-container-low"
                  >
                    <td className="px-4 py-3 font-mono text-sm font-medium">
                      <Link to={historyDetailPath(item.id)} className={detailLinkClassName}>
                        {formatEvaluationReference(item.id)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">
                      {formatPatientSnapshot(item.patient_input)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-surface-container-high">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              item.risk_level === "high"
                                ? "bg-error"
                                : item.risk_level === "medium"
                                  ? "bg-risk-medium"
                                  : "bg-risk-low",
                            )}
                            style={{ width: `${Math.min(item.risk_percent, 100)}%` }}
                          />
                        </div>
                        <span className="font-mono text-sm font-semibold tabular-nums">
                          {item.risk_percent.toFixed(1)}%
                        </span>
                        <span
                          className={cn(
                            "rounded-md px-2 py-0.5 text-xs font-semibold",
                            RISK_BADGE_CLASSES[item.risk_level],
                          )}
                        >
                          {RISK_BADGE_LABELS[item.risk_level]}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">
                      {formatRelativeEvaluationTime(item.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={historyDetailPath(item.id)}
                        className={cn(
                          "inline-flex items-center gap-1.5 text-sm font-medium",
                          detailLinkClassName,
                        )}
                        aria-label={`View evaluation ${formatEvaluationReference(item.id)}`}
                      >
                        <Eye className="size-4 shrink-0" aria-hidden />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
