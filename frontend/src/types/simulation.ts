/** Clinical simulation API types (aligned with backend/schemas/simulation.py). */

import type {
  A1cResult,
  DiabetesMedication,
  GenderValue,
  GlucoseLevel,
  MedicationChange,
  PredictRequest,
  PredictResponse,
  RiskLevel,
} from "@/types/prediction";

export interface SimulateModifications {
  age?: number;
  gender?: GenderValue;
  hospital_stay_days?: number;
  medications_count?: number;
  previous_admissions?: number;
  glucose?: number;
  glucose_level?: GlucoseLevel;
  blood_pressure?: number;
  bmi?: number;
  number_outpatient?: number;
  number_emergency?: number;
  num_lab_procedures?: number;
  num_procedures?: number;
  number_diagnoses?: number;
  active_diabetes_meds_count?: number;
  has_insulin?: boolean;
  race?: string;
  a1c_result?: A1cResult;
  medication_change?: MedicationChange;
  diabetes_medication?: DiabetesMedication;
}

export interface SimulateRequest {
  prediction_id: string;
  modifications: SimulateModifications;
}

export interface SimulationChangeItem {
  feature_name: string;
  original_value: string | null;
  simulated_value: string | null;
}

export interface SimulateResponse {
  id: string;
  prediction_id: string;
  original_risk_score: number;
  original_risk_percent: number;
  original_risk_level: RiskLevel;
  simulated_risk_score: number;
  simulated_risk_percent: number;
  simulated_risk_level: RiskLevel;
  delta_risk_percent: number;
  simulation_summary: string;
  changes: SimulationChangeItem[];
  simulation_time_ms: number;
  model_version: string;
  created_at: string;
}

/** Editable clinical variables on the simulation screen (subset of API fields). */
export interface SimulationFormValues {
  age: number;
  gender: GenderValue;
  bmi: string;
  blood_pressure: number;
  glucose: number;
  hospital_stay_days: number;
  medications_count: number;
  previous_admissions: number;
  number_outpatient: number;
  number_emergency: number;
}

export interface SimulationLocationState {
  predictionId: string;
  baseline: PredictRequest;
  result: PredictResponse;
  originalRisk: {
    risk_score: number;
    risk_percent: number;
    risk_level: RiskLevel;
  };
}

/** Router state when opening simulation; resetDraft starts from baseline (Run simulation). */
export interface SimulationNavigationState extends SimulationLocationState {
  resetDraft?: boolean;
}
