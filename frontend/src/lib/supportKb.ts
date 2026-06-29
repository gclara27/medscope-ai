/** Static knowledge base content for the Support center (T-X05-01, RF-072, UC-064). */

export type SupportKbCategoryId =
  | "getting-started"
  | "ai-calibration"
  | "data-integration"
  | "compliance-security";

export type SupportKbIconId = "rocket" | "sliders-horizontal" | "cable" | "shield-check";

export interface SupportKbCategory {
  id: SupportKbCategoryId;
  title: string;
  description: string;
  icon: SupportKbIconId;
}

export const DEFAULT_SUPPORT_CONTACT_EMAIL = "support@medscope.ai";

export const SUPPORT_CENTER_COPY = {
  title: "Clinical Support Center",
  description:
    "Access documentation, troubleshoot AI model behaviors, or contact the bioinformatics team for specialized technical assistance.",
  knowledgeBaseHeading: "Knowledge Base Topics",
  searchPlaceholder: "Search clinical knowledge base…",
  noResultsMessage: "No knowledge base topics match your search.",
  contactHeading: "Institutional IT Team",
  contactDescription: "For immediate, critical system outages.",
  contactEmailLabel: "Support email",
} as const;

export const SUPPORT_KB_CATEGORIES: readonly SupportKbCategory[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    description:
      "Initial setup, user roles, and navigating the MedScope AI dashboard effectively.",
    icon: "rocket",
  },
  {
    id: "ai-calibration",
    title: "AI Model Calibration",
    description:
      "Adjusting sensitivity thresholds, understanding confidence scores, and localized tuning.",
    icon: "sliders-horizontal",
  },
  {
    id: "data-integration",
    title: "Data Integration",
    description:
      "EHR syncing, HL7 protocols, and troubleshooting patient record mismatches.",
    icon: "cable",
  },
  {
    id: "compliance-security",
    title: "Compliance & Security",
    description: "HIPAA guidelines, audit logs, and managing data anonymization settings.",
    icon: "shield-check",
  },
] as const;

/** Client-side filter for knowledge base search (T-X05-03). */
export function filterSupportKbCategories(
  categories: readonly SupportKbCategory[],
  query: string,
): SupportKbCategory[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [...categories];
  }

  return categories.filter((category) => {
    const haystack = `${category.title} ${category.description}`.toLowerCase();
    return haystack.includes(normalized);
  });
}
