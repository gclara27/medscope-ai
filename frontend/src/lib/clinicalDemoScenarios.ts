/**
 * De-identified synthetic demo scenarios for Evaluation (T-907, US-044).
 * Payloads validated offline against production LR v1.0.0 (thresholds 0.5 / 0.35).
 */

import { buildPredictRequest } from "@/lib/clinicalFormDefaults";
import type { ClinicalFormValues, PredictRequest, RiskLevel } from "@/types/prediction";

export type ClinicalDemoScenarioId =
  | "high-readmission"
  | "moderate-risk"
  | "low-risk-stable"
  | "simulation-showcase";

export interface ClinicalDemoScenario {
  id: ClinicalDemoScenarioId;
  title: string;
  vignette: string;
  /** Expected risk band for demo narrative (validated against production model). */
  expectedRisk: RiskLevel;
  formValues: ClinicalFormValues;
  /** Optional presenter hint for Simulation (simulation-showcase). */
  simulationHint?: string;
}

/** Shared high-risk form values (high-readmission + simulation-showcase). */
export const HIGH_READMISSION_DEMO_FORM: ClinicalFormValues = {
  age: 72,
  gender: "Female",
  previous_admissions: 5,
  glucose: 198,
  medications_count: 12,
  hospital_stay_days: 6,
  bmi: "31.2",
  blood_pressure: 142,
  number_outpatient: 0,
  number_emergency: 0,
};

export const CLINICAL_DEMO_SCENARIOS: ClinicalDemoScenario[] = [
  {
    id: "high-readmission",
    title: "High readmission risk",
    vignette: "72F with five prior admissions, elevated glucose, and polypharmacy.",
    expectedRisk: "high",
    formValues: HIGH_READMISSION_DEMO_FORM,
  },
  {
    id: "moderate-risk",
    title: "Moderate risk profile",
    vignette: "58M with one prior admission and suboptimal glucose control.",
    expectedRisk: "medium",
    formValues: {
      age: 58,
      gender: "Male",
      previous_admissions: 1,
      glucose: 165,
      medications_count: 6,
      hospital_stay_days: 4,
      bmi: "29.0",
      blood_pressure: 128,
      number_outpatient: 0,
      number_emergency: 0,
    },
  },
  {
    id: "low-risk-stable",
    title: "Low risk — stable outpatient",
    vignette: "42F with no prior admissions and well-controlled metabolic metrics.",
    expectedRisk: "low",
    formValues: {
      age: 42,
      gender: "Female",
      previous_admissions: 0,
      glucose: 108,
      medications_count: 3,
      hospital_stay_days: 2,
      bmi: "24.5",
      blood_pressure: 118,
      number_outpatient: 0,
      number_emergency: 0,
    },
  },
  {
    id: "simulation-showcase",
    title: "Intervention simulation",
    vignette: "High-risk profile for demonstrating what-if clinical adjustments.",
    expectedRisk: "high",
    formValues: { ...HIGH_READMISSION_DEMO_FORM },
    simulationHint:
      "After predict, open Simulation and reduce Previous admissions to 2 and Glucose to 140.",
  },
];

export const CLINICAL_DEMO_SCENARIO_IDS: ClinicalDemoScenarioId[] = CLINICAL_DEMO_SCENARIOS.map(
  (scenario) => scenario.id,
);

export function getClinicalDemoScenario(
  id: ClinicalDemoScenarioId,
): ClinicalDemoScenario | undefined {
  return CLINICAL_DEMO_SCENARIOS.find((scenario) => scenario.id === id);
}

export function buildScenarioPredictRequest(
  scenario: ClinicalDemoScenario,
): PredictRequest {
  return buildPredictRequest(scenario.formValues);
}
