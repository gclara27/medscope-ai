/** Clinical prediction API types (aligned with backend/schemas/prediction.py). */

export type GenderValue =
  | "Male"
  | "Female"
  | "Unknown"
  | "male"
  | "female"
  | "M"
  | "F";

export type GlucoseLevel = "Norm" | ">200" | ">300" | "None";

export type A1cResult = "None" | "Norm" | ">7" | ">8";

export type MedicationChange = "No" | "Ch";

export type DiabetesMedication = "Yes" | "No";

export type RiskLevel = "low" | "medium" | "high";

/** Payload for POST /predict (RF-020, RF-022). */
export interface PredictRequest {
  age: number;
  gender: GenderValue;
  hospital_stay_days: number;
  medications_count: number;
  previous_admissions: number;
  glucose?: number | null;
  glucose_level?: GlucoseLevel | null;
  blood_pressure?: number | null;
  bmi?: number | null;
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

export interface ShapExplanationItem {
  feature_name: string;
  feature_value: string | number | boolean | null;
  shap_value: number;
  importance_rank: number;
  direction: string;
  impact_direction: "positive" | "negative";
}

export interface PredictResponse {
  id: string;
  risk_score: number;
  risk_percent: number;
  risk_level: RiskLevel;
  confidence_score: number | null;
  summary: string;
  model_version: string;
  prediction_time_ms: number;
  shap_explanations: ShapExplanationItem[];
  created_at: string;
}

/** Form state for the clinical evaluation screen (T-510). */
export interface ClinicalFormValues {
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
