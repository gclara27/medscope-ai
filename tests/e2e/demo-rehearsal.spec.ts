import { expect, type Page, test } from "@playwright/test";

import { DEMO_USERS, loginAs } from "./helpers/auth";
import { clickNavLink } from "./helpers/navigation";

async function expandDemoScenarios(page: Page): Promise<void> {
  const toggle = page.getByRole("button", { name: /show demo clinical scenarios/i });
  if (await toggle.isVisible()) {
    await toggle.click();
  }
}

async function selectDemoScenario(page: Page, titlePattern: RegExp): Promise<void> {
  await expandDemoScenarios(page);
  await page.getByRole("button", { name: new RegExp(`load demo scenario: ${titlePattern.source}`, "i") }).click();
}

/**
 * MT-P10-DEMO-001 — Full defense rehearsal (T-903).
 * Admin covers full RBAC path (incl. Analytics); clinical steps mirror clinician demo guion.
 */
test.describe("Demo defense rehearsal (MT-P10-DEMO-001, T-903)", () => {
  test("admin completes scripted demo with clinical scenarios", async ({ page }) => {
    await loginAs(page, DEMO_USERS.admin);

    await expect(
      page.getByRole("heading", { name: /clinical dashboard/i }),
    ).toBeVisible();

    await clickNavLink(page, "Evaluation");
    await expect(
      page.getByRole("heading", { name: /clinical evaluation/i }),
    ).toBeVisible();

    await selectDemoScenario(page, /high readmission risk/i);
    await expect(page.getByLabel("Age (years)")).toHaveValue("72");
    await expect(page.getByLabel(/blood glucose/i)).toHaveValue("198");
    await expect(page.getByLabel(/previous admissions/i)).toHaveValue("5");

    await page.getByRole("button", { name: /generate ai prediction/i }).click();
    await expect(page).toHaveURL(/\/evaluation\/result/);
    await expect(
      page.getByRole("heading", { name: /prediction result/i }),
    ).toBeVisible();
    await expect(page.getByText(/82\.[45]\d% \(high\)/)).toBeVisible();
    await expect(
      page.getByRole("region", { name: /shap explainability chart/i }),
    ).toBeVisible();

    await page.getByRole("link", { name: /run simulation/i }).click();
    await expect(page).toHaveURL(/\/simulation/);

    await page.locator("#sim-admissions").fill("2");
    await page.locator("#sim-glucose").fill("140");
    await page.getByRole("button", { name: /recalculate risk/i }).click();

    await expect(page.getByLabel(/risk comparison summary/i)).toBeVisible({
      timeout: 25_000,
    });
    const summary = page.getByLabel(/risk comparison summary/i);
    await expect(summary).toContainText(/62\.0%/);
    await expect(summary).toContainText(/82\.5%/);
    await expect(summary).toContainText(/-20\.5/);

    await clickNavLink(page, "History");
    await expect(
      page.getByRole("heading", { name: /prediction history/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("main").getByRole("link", { name: /^view$/i }).first(),
    ).toBeVisible({ timeout: 15_000 });

    await clickNavLink(page, "Analytics");
    await expect(
      page.getByRole("heading", { name: /population analytics/i }),
    ).toBeVisible();
    await expect(page.getByLabel(/analytics kpis/i)).toBeVisible();
  });

  test("moderate and low scenarios produce expected risk bands", async ({ page }) => {
    await loginAs(page, DEMO_USERS.admin);
    await clickNavLink(page, "Evaluation");

    const scenarios = [
      { title: /moderate risk profile/i, scorePattern: /49\.\d%/ },
      { title: /low risk — stable outpatient/i, scorePattern: /34\.\d%/ },
    ] as const;

    for (const scenario of scenarios) {
      await selectDemoScenario(page, scenario.title);
      await page.getByRole("button", { name: /generate ai prediction/i }).click();
      await expect(page).toHaveURL(/\/evaluation\/result/);
      await expect(page.getByText(scenario.scorePattern)).toBeVisible();
      await clickNavLink(page, "Evaluation");
    }
  });
});
