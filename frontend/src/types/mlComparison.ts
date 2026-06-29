/** Offline ML model comparison API types (T-X07-03, RF-076, RF-077). */

export interface ModelMetricsSnapshot {
  accuracy: number;
  recall: number;
  precision: number;
  f1: number;
  roc_auc: number;
}

export interface ModelComparisonItem {
  model_id: string;
  display_name: string;
  version: string | null;
  is_production: boolean;
  metrics: ModelMetricsSnapshot | null;
  available: boolean;
}

export interface ModelComparisonResponse {
  is_available: boolean;
  primary_metric: string;
  recall_winner: string | null;
  baseline_winner: string | null;
  production_model_id: string | null;
  production_model_version: string | null;
  summary: string | null;
  rationale: string[];
  offline_note: string;
  missing_artifacts: string[];
  models: ModelComparisonItem[];
}
