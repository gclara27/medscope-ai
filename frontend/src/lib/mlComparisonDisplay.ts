import type { ModelComparisonItem, ModelComparisonResponse } from "@/types/mlComparison";
import type { ChartColorPalette } from "@/lib/chartTheme";
import { CHART_COLORS_LIGHT } from "@/lib/chartTheme";

/** Format offline evaluation metric as percentage (0–1 scale). */
export function formatModelMetric(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) {
    return "—";
  }
  return `${(value * 100).toFixed(1)}%`;
}

export function formatPrimaryMetricLabel(metric: string): string {
  switch (metric) {
    case "recall":
      return "Recall";
    case "f1":
      return "F1";
    case "roc_auc":
      return "ROC-AUC";
    case "accuracy":
      return "Accuracy";
    default:
      return metric.replace(/_/g, " ");
  }
}

function getMetricValue(
  metrics: NonNullable<ModelComparisonItem["metrics"]>,
  metric: string,
): number | null {
  if (metric in metrics) {
    return metrics[metric as keyof typeof metrics];
  }
  return null;
}

function describePrimaryMetric(metric: string): string {
  switch (metric) {
    case "recall":
      return (
        "Recall measures how many patients who will actually be readmitted are correctly flagged as high risk. " +
        "In readmission screening, missing an at-risk patient is often more harmful than a false alarm, so recall is the main selection criterion."
      );
    case "f1":
      return (
        "F1 balances precision and recall. It is used here as the main criterion to compare candidates on the same validation split."
      );
    case "roc_auc":
      return (
        "ROC-AUC summarizes ranking quality across thresholds. Higher values indicate better separation between readmitted and non-readmitted patients."
      );
    case "accuracy":
      return (
        "Accuracy measures overall correct predictions. It can be misleading when readmissions are rare, so it is shown for context alongside recall."
      );
    default:
      return `Candidates are compared on ${formatPrimaryMetricLabel(metric).toLowerCase()} using the same offline validation split.`;
  }
}

function describeTradeoff(
  production: ModelComparisonItem,
  other: ModelComparisonItem,
  primaryMetric: string,
): string {
  if (!production.metrics || !other.metrics) {
    return "";
  }

  const productionRecall = production.metrics.recall;
  const otherRecall = other.metrics.recall;
  const productionAccuracy = production.metrics.accuracy;
  const otherAccuracy = other.metrics.accuracy;

  if (primaryMetric === "recall" && otherAccuracy > productionAccuracy + 0.05) {
    return (
      `${other.display_name} reports higher accuracy (${formatModelMetric(otherAccuracy)}) but lower recall ` +
      `(${formatModelMetric(otherRecall)}), so it would miss more patients who are later readmitted.`
    );
  }

  if (otherRecall < productionRecall) {
    return (
      `${other.display_name} reaches ${formatModelMetric(otherRecall)} recall versus ` +
      `${formatModelMetric(productionRecall)} for ${production.display_name}, so it identifies fewer true readmission cases.`
    );
  }

  const otherPrimary = getMetricValue(other.metrics, primaryMetric);
  const productionPrimary = getMetricValue(production.metrics, primaryMetric);
  if (otherPrimary != null && productionPrimary != null && otherPrimary < productionPrimary) {
    return (
      `${other.display_name} scores ${formatModelMetric(otherPrimary)} on ` +
      `${formatPrimaryMetricLabel(primaryMetric).toLowerCase()} compared with ` +
      `${formatModelMetric(productionPrimary)} for ${production.display_name}.`
    );
  }

  return `${other.display_name} did not outperform ${production.display_name} on the primary selection metric.`;
}

export interface ProductionModelExplanation {
  title: string;
  intro: string;
  selectionReason: string;
  comparisons: string[];
  caveat: string | null;
}

/** Plain-language rationale for the deployed model (RF-076, RIA-041). */
export function buildProductionModelExplanation(
  comparison: Pick<
    ModelComparisonResponse,
    "production_model_id" | "primary_metric" | "recall_winner" | "models"
  >,
): ProductionModelExplanation | null {
  if (!comparison.production_model_id) {
    return null;
  }

  const production = comparison.models.find(
    (model) => model.model_id === comparison.production_model_id,
  );
  if (!production?.available || !production.metrics) {
    return null;
  }

  const primaryMetric = comparison.primary_metric;
  const primaryLabel = formatPrimaryMetricLabel(primaryMetric);
  const productionPrimary = getMetricValue(production.metrics, primaryMetric) ?? production.metrics.recall;

  const competitors = comparison.models
    .filter(
      (model) =>
        model.available &&
        model.metrics &&
        model.model_id !== production.model_id,
    )
    .sort((left, right) => {
      const leftValue = getMetricValue(left.metrics!, primaryMetric) ?? 0;
      const rightValue = getMetricValue(right.metrics!, primaryMetric) ?? 0;
      return rightValue - leftValue;
    });

  const selectionReason =
    `${production.display_name} is deployed in production because it achieved the highest ` +
    `${primaryLabel.toLowerCase()} (${formatModelMetric(productionPrimary)}) among the candidates ` +
    `evaluated offline on the same validation split.`;

  const comparisons = competitors
    .map((competitor) => describeTradeoff(production, competitor, primaryMetric))
    .filter((line) => line.length > 0);

  let caveat: string | null = null;
  if (
    comparison.recall_winner &&
    comparison.recall_winner !== comparison.production_model_id
  ) {
    const recallLeader = comparison.models.find(
      (model) => model.model_id === comparison.recall_winner,
    );
    caveat =
      `${recallLeader?.display_name ?? comparison.recall_winner} leads on recall in the latest offline ` +
      `evaluation, but ${production.display_name} remains in production per the current model manifest.`;
  }

  return {
    title: "Why this production model?",
    intro: describePrimaryMetric(primaryMetric),
    selectionReason,
    comparisons,
    caveat,
  };
}

export function getModelComparisonSummary(
  models: ModelComparisonItem[],
  recallWinner: string | null,
): string {
  const availableCount = models.filter((model) => model.available).length;
  if (availableCount === 0) {
    return "No offline evaluation metrics are available.";
  }
  if (recallWinner) {
    const winner = models.find((model) => model.model_id === recallWinner);
    if (winner) {
      return `${winner.display_name} leads on recall among ${availableCount} evaluated candidates.`;
    }
  }
  return `${availableCount} model candidates with offline evaluation metrics.`;
}

export interface ModelComparisonChartDatum {
  model: string;
  metricPercent: number;
  fill: string;
  isProduction: boolean;
}

/** Bar chart rows for the primary offline metric (T-X07-05, RIA-041). */
export function mapModelComparisonChartData(
  models: ModelComparisonItem[],
  primaryMetric: string,
  productionModelId: string | null,
  colors: Pick<ChartColorPalette, "primary" | "teal"> = CHART_COLORS_LIGHT,
): ModelComparisonChartDatum[] {
  return models
    .filter((model) => model.available && model.metrics)
    .map((model) => {
      const metricValue =
        getMetricValue(model.metrics!, primaryMetric) ?? model.metrics!.recall;
      return {
        model: model.display_name,
        metricPercent: Number((metricValue * 100).toFixed(1)),
        fill:
          model.model_id === productionModelId ? colors.primary : colors.teal,
        isProduction: model.model_id === productionModelId,
      };
    });
}
