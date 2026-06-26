import { describe, expect, it } from "vitest";

import { DEFAULT_CLINICAL_FORM_VALUES } from "@/lib/clinicalFormDefaults";
import {
  hasClinicalFormErrors,
  validateClinicalForm,
} from "@/lib/clinicalFormValidation";

describe("validateClinicalForm", () => {
  it("accepts default demo values", () => {
    const errors = validateClinicalForm(DEFAULT_CLINICAL_FORM_VALUES);
    expect(hasClinicalFormErrors(errors)).toBe(false);
  });

  it("rejects age outside range", () => {
    const errors = validateClinicalForm({
      ...DEFAULT_CLINICAL_FORM_VALUES,
      age: 150,
    });

    expect(errors.age).toMatch(/between 0 and 120/i);
  });

  it("rejects missing glucose", () => {
    const errors = validateClinicalForm({
      ...DEFAULT_CLINICAL_FORM_VALUES,
      glucose: Number.NaN,
    });

    expect(errors.glucose).toMatch(/required/i);
  });

  it("rejects glucose above range", () => {
    const errors = validateClinicalForm({
      ...DEFAULT_CLINICAL_FORM_VALUES,
      glucose: 700,
    });

    expect(errors.glucose).toMatch(/between 0 and 600/i);
  });

  it("rejects invalid optional BMI", () => {
    const errors = validateClinicalForm({
      ...DEFAULT_CLINICAL_FORM_VALUES,
      bmi: "not-a-number",
    });

    expect(errors.bmi).toMatch(/valid number/i);
  });

  it("rejects BMI outside range when provided", () => {
    const errors = validateClinicalForm({
      ...DEFAULT_CLINICAL_FORM_VALUES,
      bmi: "5",
    });

    expect(errors.bmi).toMatch(/between 10 and 80/i);
  });

  it("allows empty optional BMI", () => {
    const errors = validateClinicalForm({
      ...DEFAULT_CLINICAL_FORM_VALUES,
      bmi: "",
    });

    expect(errors.bmi).toBeUndefined();
    expect(hasClinicalFormErrors(errors)).toBe(false);
  });

  it("rejects hospital stay below minimum", () => {
    const errors = validateClinicalForm({
      ...DEFAULT_CLINICAL_FORM_VALUES,
      hospital_stay_days: 0,
    });

    expect(errors.hospital_stay_days).toMatch(/between 1 and 60/i);
  });

  it("collects multiple field errors", () => {
    const errors = validateClinicalForm({
      ...DEFAULT_CLINICAL_FORM_VALUES,
      age: -1,
      glucose: 900,
      medications_count: 99,
    });

    expect(errors.age).toBeDefined();
    expect(errors.glucose).toBeDefined();
    expect(errors.medications_count).toBeDefined();
    expect(Object.keys(errors).length).toBeGreaterThanOrEqual(3);
  });
});
