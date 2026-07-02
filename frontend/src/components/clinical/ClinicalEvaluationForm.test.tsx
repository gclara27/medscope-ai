import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { ClinicalEvaluationForm } from "@/components/clinical/ClinicalEvaluationForm";
import { buildPredictRequest } from "@/lib/clinicalFormDefaults";
import type { ClinicalFormValues } from "@/types/prediction";

const highRiskValues: ClinicalFormValues = {
  age: 72,
  gender: "Female",
  bmi: "31.2",
  blood_pressure: 142,
  glucose: 198,
  hospital_stay_days: 6,
  medications_count: 12,
  previous_admissions: 5,
  number_outpatient: 0,
  number_emergency: 0,
};

function ControlledFormHarness({
  initialValues,
}: {
  initialValues: ClinicalFormValues;
}) {
  const [values, setValues] = useState(initialValues);
  return <ClinicalEvaluationForm values={values} onValuesChange={setValues} />;
}

describe("ClinicalEvaluationForm", () => {
  it("renders clinical sections and submit button", () => {
    render(<ClinicalEvaluationForm />);

    expect(screen.getByText(/patient demographics/i)).toBeInTheDocument();
    expect(screen.getByText(/current vital signs/i)).toBeInTheDocument();
    expect(screen.getByText(/admission details/i)).toBeInTheDocument();
    expect(screen.getByText(/clinical history/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /generate ai prediction/i }),
    ).toBeInTheDocument();
  });

  it("renders default demo values", () => {
    render(<ClinicalEvaluationForm />);

    expect(screen.getByLabelText(/age/i)).toHaveValue(65);
    expect(screen.getByLabelText(/blood glucose/i)).toHaveValue(140);
    expect(screen.getByLabelText(/biological sex/i)).toHaveValue("Female");
  });

  it("supports controlled values from a parent", async () => {
    const user = userEvent.setup();

    render(<ControlledFormHarness initialValues={highRiskValues} />);

    expect(screen.getByLabelText(/age/i)).toHaveValue(72);
    expect(screen.getByLabelText(/blood glucose/i)).toHaveValue(198);

    await user.clear(screen.getByLabelText(/age/i));
    await user.type(screen.getByLabelText(/age/i), "58");

    expect(screen.getByLabelText(/age/i)).toHaveValue(58);
    expect(screen.getByLabelText(/biological sex/i)).toHaveValue("Female");
  });

  it("builds API payload on submit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<ClinicalEvaluationForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: /generate ai prediction/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.age).toBe(65);
    expect(payload.glucose).toBe(140);
    expect(payload.gender).toBe("Female");
    expect(payload.hospital_stay_days).toBe(3);
  });

  it("blocks submit and shows errors for invalid values", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<ClinicalEvaluationForm onSubmit={onSubmit} />);

    const ageInput = screen.getByLabelText(/age/i);
    await user.clear(ageInput);
    await user.type(screen.getByLabelText(/blood glucose/i), "999");
    await user.click(screen.getByRole("button", { name: /generate ai prediction/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByText(/please correct the highlighted fields/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/age is required/i)).toBeInTheDocument();
    expect(screen.getByText(/between 0 and 600/i)).toBeInTheDocument();
  });

  it("clears field error after user corrects the value", async () => {
    const user = userEvent.setup();

    render(<ClinicalEvaluationForm />);

    const ageInput = screen.getByLabelText(/age/i);
    await user.clear(ageInput);
    await user.click(screen.getByRole("button", { name: /generate ai prediction/i }));
    expect(screen.getByText(/age is required/i)).toBeInTheDocument();

    await user.type(ageInput, "72");
    expect(screen.queryByText(/age is required/i)).not.toBeInTheDocument();
  });
});

describe("buildPredictRequest", () => {
  it("maps form values to predict request with backend defaults", () => {
    const payload = buildPredictRequest({
      age: 70,
      gender: "Male",
      bmi: "",
      blood_pressure: 130,
      glucose: 180,
      hospital_stay_days: 5,
      medications_count: 10,
      previous_admissions: 2,
      number_outpatient: 1,
      number_emergency: 0,
    });

    expect(payload).toMatchObject({
      age: 70,
      gender: "Male",
      glucose: 180,
      blood_pressure: 130,
      hospital_stay_days: 5,
      race: "Caucasian",
      diabetes_medication: "Yes",
    });
    expect(payload.bmi).toBeUndefined();
  });
});
