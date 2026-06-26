import type { ClinicalFormValues, PredictRequest } from "@/types/prediction";

/** Default form values — mirrors backend PredictRequest defaults and demo payload. */
export const DEFAULT_CLINICAL_FORM_VALUES: ClinicalFormValues = {
  age: 65,
  gender: "Female",
  bmi: "28.4",
  blood_pressure: 120,
  glucose: 140,
  hospital_stay_days: 3,
  medications_count: 8,
  previous_admissions: 1,
  number_outpatient: 0,
  number_emergency: 0,
};

const PREDICT_DEFAULTS = {
  num_lab_procedures: 25,
  num_procedures: 1,
  number_diagnoses: 4,
  active_diabetes_meds_count: 2,
  has_insulin: false,
  race: "Caucasian",
  a1c_result: "None" as const,
  medication_change: "No" as const,
  diabetes_medication: "Yes" as const,
};

/** Map form state to API payload (T-512 will POST this). */
export function buildPredictRequest(values: ClinicalFormValues): PredictRequest {
  const bmiTrimmed = values.bmi.trim();
  const bmi = bmiTrimmed === "" ? undefined : Number.parseFloat(bmiTrimmed);

  return {
    age: values.age,
    gender: values.gender,
    hospital_stay_days: values.hospital_stay_days,
    medications_count: values.medications_count,
    previous_admissions: values.previous_admissions,
    glucose: values.glucose,
    blood_pressure: values.blood_pressure,
    bmi: bmi !== undefined && !Number.isNaN(bmi) ? bmi : undefined,
    number_outpatient: values.number_outpatient,
    number_emergency: values.number_emergency,
    ...PREDICT_DEFAULTS,
  };
}
