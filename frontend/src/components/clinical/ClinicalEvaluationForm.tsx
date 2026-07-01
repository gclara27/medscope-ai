import { Activity, BedDouble, Info, LineChart, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";

import { ClinicalSection } from "@/components/clinical/ClinicalSection";
import { FieldError } from "@/components/clinical/FieldError";
import { RangeField } from "@/components/clinical/RangeField";
import { Alert } from "@/components/Alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  buildPredictRequest,
  DEFAULT_CLINICAL_FORM_VALUES,
} from "@/lib/clinicalFormDefaults";
import {
  hasClinicalFormErrors,
  validateClinicalForm,
  type ClinicalFormFieldErrors,
} from "@/lib/clinicalFormValidation";
import { cn } from "@/lib/utils";
import type { ClinicalFormValues, GenderValue, PredictRequest } from "@/types/prediction";

const GENDER_OPTIONS: { value: GenderValue; label: string }[] = [
  { value: "Female", label: "Female" },
  { value: "Male", label: "Male" },
  { value: "Unknown", label: "Unknown" },
];

const selectClassName = cn(
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground",
  "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
);

function fieldInputClass(hasError: boolean) {
  return cn(hasError && "border-error focus-visible:ring-error");
}

function parseIntegerInput(raw: string): number {
  if (raw.trim() === "") {
    return Number.NaN;
  }
  return Number.parseInt(raw, 10);
}

export interface ClinicalEvaluationFormProps {
  /** Wired in T-512 — POST /predict and navigate to result. */
  onSubmit?: (payload: PredictRequest) => void | Promise<void>;
  isSubmitting?: boolean;
  /** Controlled form values (T-907-03 demo scenario prefill). */
  values?: ClinicalFormValues;
  onValuesChange?: (values: ClinicalFormValues) => void;
}

export function ClinicalEvaluationForm({
  onSubmit,
  isSubmitting = false,
  values: controlledValues,
  onValuesChange,
}: ClinicalEvaluationFormProps) {
  const [uncontrolledValues, setUncontrolledValues] = useState<ClinicalFormValues>(
    DEFAULT_CLINICAL_FORM_VALUES,
  );
  const isControlled = controlledValues !== undefined;
  const values = isControlled ? controlledValues : uncontrolledValues;
  const [errors, setErrors] = useState<ClinicalFormFieldErrors>({});

  function setValues(next: ClinicalFormValues) {
    if (isControlled) {
      onValuesChange?.(next);
      return;
    }
    setUncontrolledValues(next);
  }

  function updateField<K extends keyof ClinicalFormValues>(
    field: K,
    value: ClinicalFormValues[K],
  ) {
    setValues({ ...values, [field]: value });
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fieldErrors = validateClinicalForm(values);
    if (hasClinicalFormErrors(fieldErrors)) {
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    const payload = buildPredictRequest(values);
    void onSubmit?.(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-12 lg:gap-8" noValidate>
      {hasClinicalFormErrors(errors) ? (
        <Alert variant="error" className="lg:col-span-12">
          Please correct the highlighted fields before generating a prediction.
        </Alert>
      ) : null}

      <div className="flex flex-col gap-6 lg:col-span-7">
        <ClinicalSection title="Patient Demographics" icon={<UserRound className="h-5 w-5" />}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="age">Age (years)</Label>
              <Input
                id="age"
                name="age"
                type="number"
                min={0}
                max={120}
                placeholder="e.g. 65"
                value={Number.isNaN(values.age) ? "" : values.age}
                aria-invalid={errors.age ? true : undefined}
                aria-describedby={errors.age ? "age-error" : undefined}
                className={fieldInputClass(Boolean(errors.age))}
                onChange={(event) => updateField("age", parseIntegerInput(event.target.value))}
              />
              <FieldError id="age-error" message={errors.age} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="gender">Biological sex</Label>
              <select
                id="gender"
                name="gender"
                className={cn(selectClassName, fieldInputClass(Boolean(errors.gender)))}
                value={values.gender}
                aria-invalid={errors.gender ? true : undefined}
                aria-describedby={errors.gender ? "gender-error" : undefined}
                onChange={(event) =>
                  updateField("gender", event.target.value as GenderValue)
                }
              >
                {GENDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <FieldError id="gender-error" message={errors.gender} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bmi">BMI (optional)</Label>
              <Input
                id="bmi"
                name="bmi"
                type="number"
                min={10}
                max={80}
                step="0.1"
                placeholder="e.g. 28.4"
                value={values.bmi}
                aria-invalid={errors.bmi ? true : undefined}
                aria-describedby={errors.bmi ? "bmi-error" : undefined}
                className={fieldInputClass(Boolean(errors.bmi))}
                onChange={(event) => updateField("bmi", event.target.value)}
              />
              <FieldError id="bmi-error" message={errors.bmi} />
            </div>
          </div>
        </ClinicalSection>

        <ClinicalSection title="Current Vital Signs" icon={<Activity className="h-5 w-5" />}>
          <div className="grid gap-5 md:grid-cols-2">
            <RangeField
              id="blood_pressure"
              label="Systolic blood pressure (mmHg)"
              min={40}
              max={250}
              value={values.blood_pressure}
              error={errors.blood_pressure}
              onChange={(value) => updateField("blood_pressure", value)}
            />

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label htmlFor="glucose">Blood glucose (mg/dL)</Label>
              <Input
                id="glucose"
                name="glucose"
                type="number"
                min={0}
                max={600}
                placeholder="e.g. 140"
                value={Number.isNaN(values.glucose) ? "" : values.glucose}
                aria-invalid={errors.glucose ? true : undefined}
                aria-describedby={errors.glucose ? "glucose-error" : undefined}
                className={fieldInputClass(Boolean(errors.glucose))}
                onChange={(event) => updateField("glucose", parseIntegerInput(event.target.value))}
              />
              <FieldError id="glucose-error" message={errors.glucose} />
            </div>
          </div>
        </ClinicalSection>
      </div>

      <div className="flex flex-col gap-6 lg:col-span-5">
        <ClinicalSection title="Admission Details" icon={<BedDouble className="h-5 w-5" />}>
          <div className="flex flex-col gap-5">
            <RangeField
              id="hospital_stay_days"
              label="Current stay duration (days)"
              min={1}
              max={60}
              value={values.hospital_stay_days}
              error={errors.hospital_stay_days}
              onChange={(value) => updateField("hospital_stay_days", value)}
            />

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="medications_count">Distinct medications</Label>
              <Input
                id="medications_count"
                name="medications_count"
                type="number"
                min={0}
                max={50}
                value={Number.isNaN(values.medications_count) ? "" : values.medications_count}
                aria-invalid={errors.medications_count ? true : undefined}
                aria-describedby={errors.medications_count ? "medications_count-error" : undefined}
                className={fieldInputClass(Boolean(errors.medications_count))}
                onChange={(event) =>
                  updateField("medications_count", parseIntegerInput(event.target.value))
                }
              />
              <FieldError id="medications_count-error" message={errors.medications_count} />
            </div>
          </div>
        </ClinicalSection>

        <ClinicalSection title="Clinical History" icon={<LineChart className="h-5 w-5" />}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="previous_admissions">Previous admissions (last 12 mo)</Label>
              <Input
                id="previous_admissions"
                name="previous_admissions"
                type="number"
                min={0}
                max={30}
                value={Number.isNaN(values.previous_admissions) ? "" : values.previous_admissions}
                aria-invalid={errors.previous_admissions ? true : undefined}
                aria-describedby={errors.previous_admissions ? "previous_admissions-error" : undefined}
                className={fieldInputClass(Boolean(errors.previous_admissions))}
                onChange={(event) =>
                  updateField("previous_admissions", parseIntegerInput(event.target.value))
                }
              />
              <FieldError id="previous_admissions-error" message={errors.previous_admissions} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="number_outpatient">Outpatient visits</Label>
              <Input
                id="number_outpatient"
                name="number_outpatient"
                type="number"
                min={0}
                max={30}
                value={Number.isNaN(values.number_outpatient) ? "" : values.number_outpatient}
                aria-invalid={errors.number_outpatient ? true : undefined}
                aria-describedby={errors.number_outpatient ? "number_outpatient-error" : undefined}
                className={fieldInputClass(Boolean(errors.number_outpatient))}
                onChange={(event) =>
                  updateField("number_outpatient", parseIntegerInput(event.target.value))
                }
              />
              <FieldError id="number_outpatient-error" message={errors.number_outpatient} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="number_emergency">Emergency visits</Label>
              <Input
                id="number_emergency"
                name="number_emergency"
                type="number"
                min={0}
                max={30}
                value={Number.isNaN(values.number_emergency) ? "" : values.number_emergency}
                aria-invalid={errors.number_emergency ? true : undefined}
                aria-describedby={errors.number_emergency ? "number_emergency-error" : undefined}
                className={fieldInputClass(Boolean(errors.number_emergency))}
                onChange={(event) =>
                  updateField("number_emergency", parseIntegerInput(event.target.value))
                }
              />
              <FieldError id="number_emergency-error" message={errors.number_emergency} />
            </div>
          </div>
        </ClinicalSection>

        <div className="mt-auto flex flex-col gap-4 border-t border-outline-variant pt-6">
          <div className="flex items-start gap-3 rounded-lg border border-primary-fixed bg-primary-fixed-dim p-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
            <p className="text-sm text-on-surface">
              Data is processed within the secure clinical environment. No patient
              identifiers are sent to external models.
            </p>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full gap-2 uppercase tracking-wide"
          >
            <LineChart className="h-4 w-4" aria-hidden />
            {isSubmitting ? "Generating prediction…" : "Generate AI Prediction"}
          </Button>
        </div>
      </div>
    </form>
  );
}
