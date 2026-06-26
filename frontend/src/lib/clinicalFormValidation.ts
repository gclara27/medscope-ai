import type { ClinicalFormValues } from "@/types/prediction";

/** Field constraints aligned with backend/schemas/prediction.py (RF-021). */
export const CLINICAL_FIELD_LIMITS = {
  age: { min: 0, max: 120 },
  bmi: { min: 10, max: 80 },
  blood_pressure: { min: 40, max: 250 },
  glucose: { min: 0, max: 600 },
  hospital_stay_days: { min: 1, max: 60 },
  medications_count: { min: 0, max: 50 },
  previous_admissions: { min: 0, max: 30 },
  number_outpatient: { min: 0, max: 30 },
  number_emergency: { min: 0, max: 30 },
} as const;

export type ClinicalFormFieldErrors = Partial<Record<keyof ClinicalFormValues, string>>;

function isIntegerInRange(value: number, min: number, max: number): boolean {
  return Number.isFinite(value) && Number.isInteger(value) && value >= min && value <= max;
}

function rangeMessage(label: string, min: number, max: number): string {
  return `${label} must be between ${min} and ${max}.`;
}

/** Client-side validation for clinical evaluation form (T-511, UC-021). */
export function validateClinicalForm(values: ClinicalFormValues): ClinicalFormFieldErrors {
  const errors: ClinicalFormFieldErrors = {};

  if (!Number.isFinite(values.age) || !Number.isInteger(values.age)) {
    errors.age = "Age is required.";
  } else if (values.age < CLINICAL_FIELD_LIMITS.age.min || values.age > CLINICAL_FIELD_LIMITS.age.max) {
    errors.age = rangeMessage("Age", CLINICAL_FIELD_LIMITS.age.min, CLINICAL_FIELD_LIMITS.age.max);
  }

  if (!values.gender) {
    errors.gender = "Biological sex is required.";
  }

  const bmiTrimmed = values.bmi.trim();
  if (bmiTrimmed !== "") {
    const bmi = Number.parseFloat(bmiTrimmed);
    if (Number.isNaN(bmi)) {
      errors.bmi = "BMI must be a valid number.";
    } else if (bmi < CLINICAL_FIELD_LIMITS.bmi.min || bmi > CLINICAL_FIELD_LIMITS.bmi.max) {
      errors.bmi = rangeMessage("BMI", CLINICAL_FIELD_LIMITS.bmi.min, CLINICAL_FIELD_LIMITS.bmi.max);
    }
  }

  if (!Number.isFinite(values.blood_pressure)) {
    errors.blood_pressure = "Systolic blood pressure is required.";
  } else if (
    values.blood_pressure < CLINICAL_FIELD_LIMITS.blood_pressure.min ||
    values.blood_pressure > CLINICAL_FIELD_LIMITS.blood_pressure.max
  ) {
    errors.blood_pressure = rangeMessage(
      "Systolic blood pressure",
      CLINICAL_FIELD_LIMITS.blood_pressure.min,
      CLINICAL_FIELD_LIMITS.blood_pressure.max,
    );
  }

  if (!Number.isFinite(values.glucose)) {
    errors.glucose = "Blood glucose is required.";
  } else if (
    values.glucose < CLINICAL_FIELD_LIMITS.glucose.min ||
    values.glucose > CLINICAL_FIELD_LIMITS.glucose.max
  ) {
    errors.glucose = rangeMessage(
      "Blood glucose",
      CLINICAL_FIELD_LIMITS.glucose.min,
      CLINICAL_FIELD_LIMITS.glucose.max,
    );
  }

  if (!isIntegerInRange(values.hospital_stay_days, CLINICAL_FIELD_LIMITS.hospital_stay_days.min, CLINICAL_FIELD_LIMITS.hospital_stay_days.max)) {
    errors.hospital_stay_days = rangeMessage(
      "Stay duration",
      CLINICAL_FIELD_LIMITS.hospital_stay_days.min,
      CLINICAL_FIELD_LIMITS.hospital_stay_days.max,
    );
  }

  if (!isIntegerInRange(values.medications_count, CLINICAL_FIELD_LIMITS.medications_count.min, CLINICAL_FIELD_LIMITS.medications_count.max)) {
    errors.medications_count = rangeMessage(
      "Distinct medications",
      CLINICAL_FIELD_LIMITS.medications_count.min,
      CLINICAL_FIELD_LIMITS.medications_count.max,
    );
  }

  if (!isIntegerInRange(values.previous_admissions, CLINICAL_FIELD_LIMITS.previous_admissions.min, CLINICAL_FIELD_LIMITS.previous_admissions.max)) {
    errors.previous_admissions = rangeMessage(
      "Previous admissions",
      CLINICAL_FIELD_LIMITS.previous_admissions.min,
      CLINICAL_FIELD_LIMITS.previous_admissions.max,
    );
  }

  if (!isIntegerInRange(values.number_outpatient, CLINICAL_FIELD_LIMITS.number_outpatient.min, CLINICAL_FIELD_LIMITS.number_outpatient.max)) {
    errors.number_outpatient = rangeMessage(
      "Outpatient visits",
      CLINICAL_FIELD_LIMITS.number_outpatient.min,
      CLINICAL_FIELD_LIMITS.number_outpatient.max,
    );
  }

  if (!isIntegerInRange(values.number_emergency, CLINICAL_FIELD_LIMITS.number_emergency.min, CLINICAL_FIELD_LIMITS.number_emergency.max)) {
    errors.number_emergency = rangeMessage(
      "Emergency visits",
      CLINICAL_FIELD_LIMITS.number_emergency.min,
      CLINICAL_FIELD_LIMITS.number_emergency.max,
    );
  }

  return errors;
}

export function hasClinicalFormErrors(errors: ClinicalFormFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
