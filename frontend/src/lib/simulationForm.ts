import type { PredictRequest } from "@/types/prediction";
import type { SimulateModifications, SimulationFormValues } from "@/types/simulation";

export function predictRequestToSimulationValues(
  request: PredictRequest,
): SimulationFormValues {
  return {
    age: request.age,
    gender: request.gender,
    bmi: request.bmi !== undefined && request.bmi !== null ? String(request.bmi) : "",
    blood_pressure: request.blood_pressure ?? 120,
    glucose: request.glucose ?? 0,
    hospital_stay_days: request.hospital_stay_days,
    medications_count: request.medications_count,
    previous_admissions: request.previous_admissions,
    number_outpatient: request.number_outpatient ?? 0,
    number_emergency: request.number_emergency ?? 0,
  };
}

function parseBmi(value: string): number | undefined {
  const trimmed = value.trim();
  if (trimmed === "") {
    return undefined;
  }
  const parsed = Number.parseFloat(trimmed);
  return Number.isNaN(parsed) ? undefined : parsed;
}

/** Build partial modifications payload — only fields that differ from baseline (UC-041). */
export function buildSimulationModifications(
  baseline: PredictRequest,
  current: SimulationFormValues,
): SimulateModifications {
  const modifications: SimulateModifications = {};

  if (current.age !== baseline.age) {
    modifications.age = current.age;
  }
  if (current.gender !== baseline.gender) {
    modifications.gender = current.gender;
  }
  if (current.hospital_stay_days !== baseline.hospital_stay_days) {
    modifications.hospital_stay_days = current.hospital_stay_days;
  }
  if (current.medications_count !== baseline.medications_count) {
    modifications.medications_count = current.medications_count;
  }
  if (current.previous_admissions !== baseline.previous_admissions) {
    modifications.previous_admissions = current.previous_admissions;
  }
  if (current.glucose !== (baseline.glucose ?? 0)) {
    modifications.glucose = current.glucose;
  }
  if (current.blood_pressure !== (baseline.blood_pressure ?? 120)) {
    modifications.blood_pressure = current.blood_pressure;
  }

  const currentBmi = parseBmi(current.bmi);
  const baselineBmi = baseline.bmi ?? undefined;
  if (currentBmi !== baselineBmi) {
    modifications.bmi = currentBmi;
  }

  const baselineOutpatient = baseline.number_outpatient ?? 0;
  const baselineEmergency = baseline.number_emergency ?? 0;
  if (current.number_outpatient !== baselineOutpatient) {
    modifications.number_outpatient = current.number_outpatient;
  }
  if (current.number_emergency !== baselineEmergency) {
    modifications.number_emergency = current.number_emergency;
  }

  return modifications;
}

export function hasSimulationModifications(modifications: SimulateModifications): boolean {
  return Object.keys(modifications).length > 0;
}
