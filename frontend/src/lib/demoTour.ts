import {
  CheckCircle2,
  FlaskConical,
  Sparkles,
  Stethoscope,
  Target,
  Trophy,
  type LucideIcon,
} from "lucide-react";

export type DemoTourStepId =
  | "welcome"
  | "case"
  | "predict"
  | "explain"
  | "simulate"
  | "complete";

export interface DemoTourStep {
  id: DemoTourStepId;
  label: string;
  shortTitle: string;
  icon: LucideIcon;
  guideTitle: string;
  guideBody: string;
  primaryAction?: string;
}

export const DEMO_TOUR_STEPS: DemoTourStep[] = [
  {
    id: "welcome",
    label: "Welcome",
    shortTitle: "Welcome",
    icon: Target,
    guideTitle: "Experience MedScope AI in 3 minutes",
    guideBody:
      "This guided demo uses de-identified synthetic patients. You will predict readmission risk, explore SHAP explanations, and run a clinical what-if simulation — no sign-in required.",
    primaryAction: "Start guided demo",
  },
  {
    id: "case",
    label: "Patient case",
    shortTitle: "Case",
    icon: Stethoscope,
    guideTitle: "Meet a high-risk patient",
    guideBody:
      "We loaded a 72-year-old patient with five prior admissions, elevated glucose, and polypharmacy — a profile that typically signals high 30-day readmission risk.",
    primaryAction: "Continue to prediction",
  },
  {
    id: "predict",
    label: "AI prediction",
    shortTitle: "Predict",
    icon: Sparkles,
    guideTitle: "Generate the risk score",
    guideBody:
      "MedScope runs a validated machine learning model in under one second. Click below to see the live readmission probability for this synthetic case.",
    primaryAction: "Generate AI prediction",
  },
  {
    id: "explain",
    label: "Explainability",
    shortTitle: "Explain",
    icon: Sparkles,
    guideTitle: "Understand why — not just the number",
    guideBody:
      "SHAP drivers show which variables push risk up or down. This transparency is essential for clinical decision support and trust.",
    primaryAction: "Try clinical simulation",
  },
  {
    id: "simulate",
    label: "Simulation",
    shortTitle: "Simulate",
    icon: FlaskConical,
    guideTitle: "Explore a what-if intervention",
    guideBody:
      "Imagine better glucose control and fewer prior admissions. We pre-filled realistic targets — recalculate to see how the estimated risk changes.",
    primaryAction: "Recalculate risk",
  },
  {
    id: "complete",
    label: "Done",
    shortTitle: "Done",
    icon: Trophy,
    guideTitle: "You have seen the core CDSS workflow",
    guideBody:
      "Sign in for the full platform: dashboard, history, analytics, and team access. This demo did not save any data.",
    primaryAction: "Sign in to MedScope AI",
  },
];

export const DEMO_TOUR_STEP_ORDER: DemoTourStepId[] = DEMO_TOUR_STEPS.map((step) => step.id);

const DEMO_TOUR_STEP_ID_SET = new Set<DemoTourStepId>(DEMO_TOUR_STEP_ORDER);

export function isDemoTourStepId(value: string | null | undefined): value is DemoTourStepId {
  return value !== null && value !== undefined && DEMO_TOUR_STEP_ID_SET.has(value as DemoTourStepId);
}

export function parseDemoTourStepId(value: string | null): DemoTourStepId | null {
  return isDemoTourStepId(value) ? value : null;
}

export function readDemoTourStepFromSearch(search: string): DemoTourStepId {
  return parseDemoTourStepId(new URLSearchParams(search).get("step")) ?? "welcome";
}

/** Resolve tour step from `/demo`, `/demo/case`, `/demo/predict`, etc. */
export function readDemoTourStepFromPath(pathname: string): DemoTourStepId {
  const match = pathname.match(/^\/demo(?:\/([^/?#]+))?\/?$/);
  return parseDemoTourStepId(match?.[1] ?? null) ?? "welcome";
}

/** Furthest step the user may view given current demo session progress. */
export function getFurthestReachableDemoStep(flags: {
  caseLoaded: boolean;
  predictionReady: boolean;
  simulationReady: boolean;
}): DemoTourStepId {
  if (flags.simulationReady) {
    return "complete";
  }
  if (flags.predictionReady) {
    return "simulate";
  }
  if (flags.caseLoaded) {
    return "predict";
  }
  return "case";
}

export function getDemoTourStep(id: DemoTourStepId): DemoTourStep {
  const step = DEMO_TOUR_STEPS.find((item) => item.id === id);
  if (!step) {
    throw new Error(`Unknown demo tour step: ${id}`);
  }
  return step;
}

export function nextDemoTourStep(id: DemoTourStepId): DemoTourStepId | null {
  const index = DEMO_TOUR_STEP_ORDER.indexOf(id);
  if (index < 0 || index >= DEMO_TOUR_STEP_ORDER.length - 1) {
    return null;
  }
  return DEMO_TOUR_STEP_ORDER[index + 1] ?? null;
}

export function isDemoTourStepComplete(
  id: DemoTourStepId,
  flags: {
    caseLoaded: boolean;
    predictionReady: boolean;
    simulationReady: boolean;
  },
): boolean {
  switch (id) {
    case "welcome":
      return true;
    case "case":
      return flags.caseLoaded;
    case "predict":
      return flags.predictionReady;
    case "explain":
      return flags.predictionReady;
    case "simulate":
      return flags.simulationReady;
    case "complete":
      return flags.simulationReady;
    default:
      return false;
  }
}

/** Whether the user can jump to a step from the progress rail. */
export function isDemoTourStepReachable(
  id: DemoTourStepId,
  flags: {
    caseLoaded: boolean;
    predictionReady: boolean;
    simulationReady: boolean;
  },
): boolean {
  switch (id) {
    case "welcome":
      return false;
    case "case":
      return true;
    case "predict":
      return flags.caseLoaded;
    case "explain":
    case "simulate":
      return flags.predictionReady;
    case "complete":
      return flags.simulationReady;
    default:
      return false;
  }
}

export const DEMO_STEP_COMPLETE_ICON = CheckCircle2;

/** Pre-filled intervention targets for the simulation step. */
export const DEMO_SIMULATION_TARGETS = {
  previous_admissions: 2,
  glucose: 140,
} as const;
