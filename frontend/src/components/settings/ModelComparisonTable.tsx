import { formatModelMetric, formatPrimaryMetricLabel } from "@/lib/mlComparisonDisplay";
import { cn } from "@/lib/utils";
import type { ModelComparisonItem } from "@/types/mlComparison";

interface ModelComparisonTableProps {
  models: ModelComparisonItem[];
  primaryMetric: string;
}

/** Offline ML metrics table with production model badge (T-X07-04, RF-076). */
export function ModelComparisonTable({ models, primaryMetric }: ModelComparisonTableProps) {
  const primaryMetricLabel = formatPrimaryMetricLabel(primaryMetric);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left" aria-label="ML model comparison">
        <thead>
          <tr className="border-b border-outline-variant text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            <th className="px-3 py-3 font-medium">Model</th>
            <th className="px-3 py-3 font-medium">Version</th>
            <th className="px-3 py-3 font-medium">{primaryMetricLabel}</th>
            <th className="px-3 py-3 font-medium">Accuracy</th>
            <th className="px-3 py-3 font-medium">Precision</th>
            <th className="px-3 py-3 font-medium">F1</th>
            <th className="px-3 py-3 font-medium">ROC-AUC</th>
          </tr>
        </thead>
        <tbody className="text-sm text-on-surface">
          {models.map((model) => {
            const metrics = model.metrics;
            const primaryValue =
              metrics && primaryMetric in metrics
                ? metrics[primaryMetric as keyof typeof metrics]
                : null;

            return (
              <tr
                key={model.model_id}
                className={cn(
                  "border-b border-outline-variant/70 align-top transition-colors hover:bg-surface-container-low",
                  model.is_production && "bg-primary/5",
                )}
              >
                <td className="px-3 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{model.display_name}</span>
                    {model.is_production ? (
                      <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-on-primary">
                        Production model
                      </span>
                    ) : null}
                    {!model.available ? (
                      <span className="rounded-full bg-surface-container-high px-2.5 py-0.5 text-xs font-medium text-on-surface-variant">
                        Not evaluated
                      </span>
                    ) : null}
                  </div>
                  <span className="mt-1 block font-mono text-xs text-on-surface-variant">
                    {model.model_id}
                  </span>
                </td>
                <td className="px-3 py-3 text-on-surface-variant">{model.version ?? "—"}</td>
                <td className="px-3 py-3 font-semibold text-primary">
                  {formatModelMetric(typeof primaryValue === "number" ? primaryValue : null)}
                </td>
                <td className="px-3 py-3">{formatModelMetric(metrics?.accuracy)}</td>
                <td className="px-3 py-3">{formatModelMetric(metrics?.precision)}</td>
                <td className="px-3 py-3">{formatModelMetric(metrics?.f1)}</td>
                <td className="px-3 py-3">{formatModelMetric(metrics?.roc_auc)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
