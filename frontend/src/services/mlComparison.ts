import { api } from "@/services/api";
import type { ModelComparisonResponse } from "@/types/mlComparison";

/** Fetch offline ML model comparison metrics (UC-084, RF-077). */
export async function getModelComparison(): Promise<ModelComparisonResponse> {
  const { data } = await api.get<ModelComparisonResponse>("/ml/models/comparison");

  if (typeof data?.is_available !== "boolean" || !Array.isArray(data?.models)) {
    throw new Error("Invalid model comparison response from API.");
  }

  return {
    ...data,
    rationale: Array.isArray(data.rationale) ? data.rationale : [],
    missing_artifacts: Array.isArray(data.missing_artifacts) ? data.missing_artifacts : [],
    models: data.models,
  };
}
