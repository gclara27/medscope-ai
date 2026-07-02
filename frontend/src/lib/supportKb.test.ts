import { describe, expect, it } from "vitest";

import {
  SUPPORT_CENTER_COPY,
  SUPPORT_KB_CATEGORIES,
  filterSupportKbCategories,
} from "@/lib/supportKb";

describe("supportKb", () => {
  it("defines four English knowledge base categories", () => {
    expect(SUPPORT_KB_CATEGORIES).toHaveLength(4);
    expect(SUPPORT_KB_CATEGORIES.map((category) => category.title)).toEqual([
      "Getting Started",
      "AI Model Calibration",
      "Data Integration",
      "Compliance & Security",
    ]);
  });

  it("uses unique category ids and icons", () => {
    const ids = SUPPORT_KB_CATEGORIES.map((category) => category.id);
    const icons = SUPPORT_KB_CATEGORIES.map((category) => category.icon);

    expect(new Set(ids).size).toBe(4);
    expect(new Set(icons).size).toBe(4);
  });

  it("exposes support center hero copy", () => {
    expect(SUPPORT_CENTER_COPY.title).toBe("Clinical Support Center");
    expect(SUPPORT_CENTER_COPY.knowledgeBaseHeading).toBe("Knowledge Base Topics");
    expect(SUPPORT_CENTER_COPY.knowledgeBaseFutureNotice).toMatch(/planned for a future release/i);
  });

  it("filterSupportKbCategories matches title and description", () => {
    const results = filterSupportKbCategories(SUPPORT_KB_CATEGORIES, "hipaa");
    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe("compliance-security");
  });

  it("filterSupportKbCategories returns all categories when query is empty", () => {
    expect(filterSupportKbCategories(SUPPORT_KB_CATEGORIES, "")).toHaveLength(4);
    expect(filterSupportKbCategories(SUPPORT_KB_CATEGORIES, "   ")).toHaveLength(4);
  });
});
