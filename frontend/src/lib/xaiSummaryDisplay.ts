/** Parse backend clinical summary (RF-032) for structured XAI display (T-515). */

export const CLINICAL_DISCLAIMER =
  "This explanation supports clinical review and is not a diagnosis.";

export interface ParsedClinicalSummary {
  paragraphs: SummaryParagraph[];
  disclaimer: string | null;
}

export interface SummaryParagraph {
  kind: "risk_drivers" | "protective_factors" | "general";
  label: string | null;
  features: string[];
  raw: string;
}

const RISK_DRIVERS_PREFIX = "Main risk drivers:";
const PROTECTIVE_PREFIX = "Factors associated with lower risk:";

export function parseClinicalSummary(summary: string): ParsedClinicalSummary {
  const trimmed = summary.trim();
  if (!trimmed) {
    return { paragraphs: [], disclaimer: null };
  }

  const sentences = trimmed.split(/(?<=\.)\s+/).filter((part) => part.length > 0);
  const paragraphs: SummaryParagraph[] = [];
  let disclaimer: string | null = null;

  for (const sentence of sentences) {
    const normalized = sentence.endsWith(".") ? sentence : `${sentence}.`;

    if (normalized.includes(CLINICAL_DISCLAIMER)) {
      disclaimer = CLINICAL_DISCLAIMER;
      continue;
    }

    if (normalized.startsWith(RISK_DRIVERS_PREFIX)) {
      paragraphs.push(parseFeatureSentence(normalized, "risk_drivers", RISK_DRIVERS_PREFIX));
      continue;
    }

    if (normalized.startsWith(PROTECTIVE_PREFIX)) {
      paragraphs.push(parseFeatureSentence(normalized, "protective_factors", PROTECTIVE_PREFIX));
      continue;
    }

    paragraphs.push({
      kind: "general",
      label: null,
      features: [],
      raw: normalized,
    });
  }

  return { paragraphs, disclaimer };
}

function parseFeatureSentence(
  sentence: string,
  kind: SummaryParagraph["kind"],
  prefix: string,
): SummaryParagraph {
  const body = sentence.slice(prefix.length).trim().replace(/\.$/, "");
  const features = body
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    kind,
    label: prefix.replace(/:$/, ""),
    features,
    raw: sentence,
  };
}
