import { SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";

import { ClinicalSection } from "@/components/clinical/ClinicalSection";
import { RangeField } from "@/components/clinical/RangeField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { GenderValue } from "@/types/prediction";
import type { SimulationFormValues } from "@/types/simulation";

const GENDER_OPTIONS: { value: GenderValue; label: string }[] = [
  { value: "Female", label: "Female" },
  { value: "Male", label: "Male" },
  { value: "Unknown", label: "Unknown" },
];

const selectClassName = cn(
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground",
  "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
);

interface SimulationControlPanelProps {
  values: SimulationFormValues;
  baselineValues: SimulationFormValues;
  onChange: (values: SimulationFormValues) => void;
  onReset: () => void;
  onRecalculate: () => void;
  isSubmitting: boolean;
}

function isModified(
  field: keyof SimulationFormValues,
  values: SimulationFormValues,
  baseline: SimulationFormValues,
): boolean {
  return values[field] !== baseline[field];
}

/** Uniform padding on every field; blue overlay on top when modified (no layout shift). */
function SimulationFieldShell({
  modified,
  children,
  className,
}: {
  modified: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative rounded-lg p-3", className)}>
      {modified ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-lg bg-primary/[0.04] shadow-[inset_0_0_0_1px_rgba(0,88,188,0.4)]"
        />
      ) : null}
      <div className="relative">{children}</div>
    </div>
  );
}

/** Sliders and inputs for what-if clinical overrides (T-520, RF-040). */
export function SimulationControlPanel({
  values,
  baselineValues,
  onChange,
  onReset,
  onRecalculate,
  isSubmitting,
}: SimulationControlPanelProps) {
  function updateField<K extends keyof SimulationFormValues>(
    field: K,
    value: SimulationFormValues[K],
  ) {
    onChange({ ...values, [field]: value });
  }

  return (
    <div className="flex flex-col gap-6">
      <ClinicalSection title="Clinical variables" icon={<SlidersHorizontal className="h-5 w-5" />}>
        <div className="flex flex-col gap-5">
          <SimulationFieldShell modified={isModified("age", values, baselineValues)}>
            <RangeField
              id="sim-age"
              label="Age (years)"
              min={0}
              max={120}
              value={values.age}
              onChange={(value) => updateField("age", value)}
            />
          </SimulationFieldShell>

          <SimulationFieldShell
            modified={isModified("gender", values, baselineValues)}
            className="flex flex-col gap-1.5"
          >
            <Label htmlFor="sim-gender">Biological sex</Label>
            <select
              id="sim-gender"
              className={selectClassName}
              value={values.gender}
              onChange={(event) => updateField("gender", event.target.value as GenderValue)}
            >
              {GENDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </SimulationFieldShell>

          <SimulationFieldShell modified={isModified("glucose", values, baselineValues)}>
            <RangeField
              id="sim-glucose"
              label="Blood glucose"
              min={0}
              max={600}
              unit="mg/dL"
              value={values.glucose}
              onChange={(value) => updateField("glucose", value)}
            />
          </SimulationFieldShell>

          <SimulationFieldShell modified={isModified("blood_pressure", values, baselineValues)}>
            <RangeField
              id="sim-bp"
              label="Systolic blood pressure"
              min={40}
              max={250}
              unit="mmHg"
              value={values.blood_pressure}
              onChange={(value) => updateField("blood_pressure", value)}
            />
          </SimulationFieldShell>

          <SimulationFieldShell modified={isModified("hospital_stay_days", values, baselineValues)}>
            <RangeField
              id="sim-stay"
              label="Hospital stay"
              min={1}
              max={60}
              unit="days"
              value={values.hospital_stay_days}
              onChange={(value) => updateField("hospital_stay_days", value)}
            />
          </SimulationFieldShell>

          <SimulationFieldShell modified={isModified("medications_count", values, baselineValues)}>
            <RangeField
              id="sim-meds"
              label="Medications count"
              min={0}
              max={50}
              value={values.medications_count}
              onChange={(value) => updateField("medications_count", value)}
            />
          </SimulationFieldShell>

          <SimulationFieldShell modified={isModified("previous_admissions", values, baselineValues)}>
            <RangeField
              id="sim-admissions"
              label="Previous admissions"
              min={0}
              max={30}
              value={values.previous_admissions}
              onChange={(value) => updateField("previous_admissions", value)}
            />
          </SimulationFieldShell>

          <div className="grid gap-4 sm:grid-cols-2">
            <SimulationFieldShell modified={isModified("number_outpatient", values, baselineValues)}>
              <RangeField
                id="sim-outpatient"
                label="Outpatient visits"
                min={0}
                max={30}
                value={values.number_outpatient}
                onChange={(value) => updateField("number_outpatient", value)}
              />
            </SimulationFieldShell>
            <SimulationFieldShell modified={isModified("number_emergency", values, baselineValues)}>
              <RangeField
                id="sim-emergency"
                label="Emergency visits"
                min={0}
                max={30}
                value={values.number_emergency}
                onChange={(value) => updateField("number_emergency", value)}
              />
            </SimulationFieldShell>
          </div>

          <SimulationFieldShell
            modified={isModified("bmi", values, baselineValues)}
            className="flex flex-col gap-1.5"
          >
            <Label htmlFor="sim-bmi">BMI (optional)</Label>
            <Input
              id="sim-bmi"
              type="number"
              min={10}
              max={80}
              step="0.1"
              value={values.bmi}
              onChange={(event) => updateField("bmi", event.target.value)}
            />
          </SimulationFieldShell>
        </div>
      </ClinicalSection>

      <div className="flex flex-col gap-3 border-t border-outline-variant pt-4">
        <Button type="button" variant="outline" onClick={onReset} disabled={isSubmitting}>
          Reset to baseline
        </Button>
        <Button type="button" onClick={onRecalculate} disabled={isSubmitting} className="gap-2">
          {isSubmitting ? "Recalculating…" : "Recalculate risk"}
        </Button>
      </div>
    </div>
  );
}
