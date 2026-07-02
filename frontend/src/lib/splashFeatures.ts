import type { LucideIcon } from "lucide-react";
import { FlaskConical, Gauge, Sparkles } from "lucide-react";

export type SplashFeatureId = "risk-scoring" | "xai" | "simulation";

export interface SplashFeature {
  id: SplashFeatureId;
  icon: LucideIcon;
  title: string;
  description: string;
  summary: string;
  bullets: string[];
}

export const SPLASH_FEATURES: SplashFeature[] = [
  {
    id: "risk-scoring",
    icon: Gauge,
    title: "Real-time risk scoring",
    description: "30-day readmission risk in under one second.",
    summary:
      "MedScope estimates the probability that a patient will be readmitted within 30 days using a validated machine learning model trained on de-identified clinical cohort data.",
    bullets: [
      "Combines demographics, labs, medications, and prior utilization patterns.",
      "Returns a percentage score and risk band (low, medium, high) for triage.",
      "Designed for sub-second inference to support bedside and discharge workflows.",
    ],
  },
  {
    id: "xai",
    icon: Sparkles,
    title: "Explainable AI (XAI)",
    description: "SHAP drivers for transparent clinical insight.",
    summary:
      "Every prediction includes SHAP-based explanations that show which variables push risk up or down — so clinicians can interpret the model, not just the number.",
    bullets: [
      "Ranked feature contributions with direction (increases vs decreases risk).",
      "Supports shared decision-making and auditability in regulated environments.",
      "Aligns with CDSS best practice: AI as decision support, not a black box.",
    ],
  },
  {
    id: "simulation",
    icon: FlaskConical,
    title: "Clinical simulation",
    description: "What-if scenarios without changing the record.",
    summary:
      "Adjust key clinical variables — such as glucose control or prior admissions — and instantly see how the estimated readmission risk changes.",
    bullets: [
      "Compare baseline vs simulated risk side by side with a clear delta.",
      "Explore intervention scenarios before they happen in real care.",
      "Ideal for teaching, rounds, and demonstrating the value of modifiable drivers.",
    ],
  },
];

export function getSplashFeature(id: SplashFeatureId): SplashFeature | undefined {
  return SPLASH_FEATURES.find((feature) => feature.id === id);
}
