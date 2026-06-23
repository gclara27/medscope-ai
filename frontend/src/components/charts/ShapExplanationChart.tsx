import { prepareShapBarRows } from "@/lib/shapDisplay";
import { cn } from "@/lib/utils";
import type { ShapExplanationItem } from "@/types/prediction";

interface ShapExplanationChartProps {
  explanations: ShapExplanationItem[];
  className?: string;
}

/** Horizontal SHAP feature importance bars (T-514, RFW-023, UC-030). */
export function ShapExplanationChart({
  explanations,
  className,
}: ShapExplanationChartProps) {
  const rows = prepareShapBarRows(explanations);

  if (rows.length === 0) {
    return (
      <p className="text-sm text-on-surface-variant">
        No explainability factors were returned for this prediction.
      </p>
    );
  }

  return (
    <section className={cn("space-y-6", className)} aria-label="SHAP explainability chart">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-outline-variant pb-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-on-surface-variant">
            Explainable AI (XAI) Analysis
          </h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Factors influencing the model output, ranked by importance.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-xs font-medium text-on-surface-variant">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-risk-high" aria-hidden />
            Increased risk
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-secondary" aria-hidden />
            Decreased risk
          </span>
        </div>
      </div>

      <div className="relative space-y-4 py-2">
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 top-0 hidden w-px -translate-x-1/2 bg-outline-variant md:block"
          aria-hidden
        />

        <ol className="space-y-4">
          {rows.map((row) => (
            <li
              key={`${row.importanceRank}-${row.featureName}`}
              className="grid grid-cols-1 items-center gap-2 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-4"
            >
              <div className="flex items-center justify-between gap-3 md:justify-end md:text-right">
                <div className="min-w-0 md:text-right">
                  <p className="font-mono text-sm text-on-surface">{row.featureName}</p>
                  <p className="text-xs text-on-surface-variant">Value: {row.featureValue}</p>
                </div>
                <span
                  className={cn(
                    "shrink-0 text-xs font-semibold md:hidden",
                    row.increasesRisk ? "text-risk-high" : "text-secondary",
                  )}
                >
                  {row.impactLabel}
                </span>
              </div>

              <span className="hidden text-center font-mono text-[10px] text-outline md:block">
                #{row.importanceRank}
              </span>

              <div className="relative flex h-6 w-full items-center">
                {row.increasesRisk ? (
                  <>
                    <div className="hidden w-1/2 md:block" aria-hidden />
                    <div className="flex h-6 w-full items-center md:w-1/2">
                      <div
                        className="flex h-full min-w-[2rem] items-center justify-end rounded-r-sm bg-risk-high pr-2 transition-opacity hover:opacity-90"
                        style={{ width: `${Math.max(row.barWidthPercent, 12)}%` }}
                        title={`${row.featureName}: ${row.impactLabel}`}
                      >
                        <span className="hidden text-xs font-semibold text-on-primary md:inline">
                          {row.impactLabel}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex h-6 w-full items-center justify-end md:w-1/2">
                      <div
                        className="flex h-full min-w-[2rem] items-center justify-start rounded-l-sm bg-secondary pl-2 transition-opacity hover:opacity-90"
                        style={{ width: `${Math.max(row.barWidthPercent, 12)}%` }}
                        title={`${row.featureName}: ${row.impactLabel}`}
                      >
                        <span className="hidden text-xs font-semibold text-on-primary md:inline">
                          {row.impactLabel}
                        </span>
                      </div>
                    </div>
                    <div className="hidden w-1/2 md:block" aria-hidden />
                  </>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
