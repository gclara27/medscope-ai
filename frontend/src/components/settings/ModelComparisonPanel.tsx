import { BrainCircuit } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { ModelComparisonMetricChart } from "@/components/settings/ModelComparisonMetricChart";
import { ModelComparisonTable } from "@/components/settings/ModelComparisonTable";
import { ModelSelectionExplanation } from "@/components/settings/ModelSelectionExplanation";
import { Alert } from "@/components/Alert";
import { Spinner } from "@/components/Spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatPrimaryMetricLabel,
  getModelComparisonSummary,
} from "@/lib/mlComparisonDisplay";
import { getModelComparison } from "@/services/mlComparison";
import type { ModelComparisonResponse } from "@/types/mlComparison";
import { getMlComparisonErrorMessage } from "@/utils/mlComparisonErrors";

/** Offline ML model comparison for analyst/admin review (T-X07-04, UC-084, RFW-026). */
export function ModelComparisonPanel() {
  const [comparison, setComparison] = useState<ModelComparisonResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComparison = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getModelComparison();
      setComparison(response);
    } catch (loadError) {
      setComparison(null);
      setError(getMlComparisonErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadComparison();
  }, [loadComparison]);

  const summaryText =
    comparison?.summary ??
    (comparison ? getModelComparisonSummary(comparison.models, comparison.recall_winner) : null);

  return (
    <Card className="border-outline-variant bg-surface-container-lowest shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center gap-2 text-lg text-on-surface">
          <BrainCircuit className="h-5 w-5 text-primary" aria-hidden />
          ML model comparison
        </CardTitle>
        <p className="text-sm text-on-surface-variant">
          Review offline training metrics for candidate models. Production inference still uses a
          single model loaded at API startup.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {error ? <Alert variant="error">{error}</Alert> : null}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner label="Loading model comparison" />
          </div>
        ) : comparison && !comparison.is_available ? (
          <Alert variant="info">
            Model comparison is unavailable. Missing artifacts:{" "}
            {comparison.missing_artifacts.length > 0
              ? comparison.missing_artifacts.join(", ")
              : "training evaluation files"}
            .
          </Alert>
        ) : comparison ? (
          <>
            <section
              aria-label="Model comparison summary"
              className="rounded-xl border border-outline-variant bg-surface-container-low p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-on-surface">{summaryText}</p>
                  {comparison.recall_winner ? (
                    <p className="text-xs text-on-surface-variant">
                      Recall leader:{" "}
                      <span className="font-medium text-on-surface">
                        {comparison.models.find((model) => model.model_id === comparison.recall_winner)
                          ?.display_name ?? comparison.recall_winner}
                      </span>
                    </p>
                  ) : null}
                </div>
                <p className="text-xs text-on-surface-variant">
                  Primary metric: {formatPrimaryMetricLabel(comparison.primary_metric)}
                </p>
              </div>

              <p className="mt-4 text-xs text-on-surface-variant">{comparison.offline_note}</p>
            </section>

            <ModelSelectionExplanation comparison={comparison} />

            {comparison.rationale.length > 0 ? (
              <section
                aria-label="Technical evaluation notes"
                className="rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-4"
              >
                <h3 className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                  Technical notes
                </h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-on-surface-variant">
                  {comparison.rationale.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            <ModelComparisonMetricChart
              models={comparison.models}
              primaryMetric={comparison.primary_metric}
              productionModelId={comparison.production_model_id}
            />

            <ModelComparisonTable
              models={comparison.models}
              primaryMetric={comparison.primary_metric}
            />
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
