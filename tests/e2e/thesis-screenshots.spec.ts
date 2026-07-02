import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

import { DEMO_USERS, loginAs } from "./helpers/auth";
import { clickNavLink } from "./helpers/navigation";

const OUTPUT_DIR = path.resolve(
  process.cwd(),
  "docs/figures/screenshots",
);

const VIEWPORT = { width: 1440, height: 900 };

async function capture(page: import("@playwright/test").Page, filename: string): Promise<void> {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  await page.screenshot({
    path: path.join(OUTPUT_DIR, filename),
    fullPage: true,
  });
}

/**
 * T-808 — Thesis screenshot pack (RAC-001).
 * Run: npm run test:e2e -- thesis-screenshots
 * Requires dev stack or PLAYWRIGHT_BASE_URL pointing at a deployed frontend with API.
 */
test.describe("Thesis screenshots (T-808)", () => {
  test.describe.configure({ mode: "serial" });
  test.setTimeout(180_000);

  test.beforeAll(() => {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  });

  test("capture MVP screens for thesis memory", async ({ page }) => {
    await page.setViewportSize(VIEWPORT);

    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /predictive intelligence for critical decisions/i }),
    ).toBeVisible();
    await capture(page, "01_splash.png");

    // Client-side nav only — Vite dev proxy forwards GET /demo to the API (not the SPA route).
    await page.getByRole("link", { name: /explore demo/i }).click();
    await expect(page).toHaveURL(/\/demo\/?$/);
    await page.getByRole("button", { name: /start guided demo/i }).click();
    await expect(page).toHaveURL(/\/demo\/case/);
    await expect(
      page.getByRole("heading", { name: /meet a high-risk patient/i }),
    ).toBeVisible({ timeout: 30_000 });
    await capture(page, "02_demo_case.png");

    await loginAs(page, DEMO_USERS.admin);

    await expect(
      page.getByRole("heading", { name: /clinical dashboard/i }),
    ).toBeVisible();
    await capture(page, "03_dashboard.png");

    await clickNavLink(page, "Evaluation");
    await expect(
      page.getByRole("heading", { name: /clinical evaluation/i }),
    ).toBeVisible();
    await capture(page, "04_evaluation_form.png");

    await page.getByRole("button", { name: /generate ai prediction/i }).click();
    await expect(page).toHaveURL(/\/evaluation\/result/);
    await expect(
      page.getByRole("region", { name: /shap explainability chart/i }),
    ).toBeVisible({ timeout: 25_000 });
    await capture(page, "05_prediction_result_shap.png");

    await page.getByRole("link", { name: /run simulation/i }).click();
    await expect(page).toHaveURL(/\/simulation/);
    await expect(
      page.getByRole("heading", { name: /clinical simulation/i }),
    ).toBeVisible();

    const admissionsSlider = page.getByRole("slider", { name: /previous admissions/i });
    await admissionsSlider.fill("0");
    await expect(page.getByRole("region", { name: /^risk comparison$/i })).toContainText(
      /difference/i,
      { timeout: 25_000 },
    );
    await capture(page, "06_simulation.png");

    await clickNavLink(page, "History");
    await expect(
      page.getByRole("heading", { name: /prediction history/i }),
    ).toBeVisible();
    await expect(page.getByRole("main").getByRole("link", { name: /^view$/i }).first()).toBeVisible({
      timeout: 15_000,
    });
    await capture(page, "07_history.png");

    await clickNavLink(page, "Analytics");
    await expect(
      page.getByRole("heading", { name: /population analytics/i }),
    ).toBeVisible();
    await expect(page.getByLabel(/analytics kpis/i)).toBeVisible();
    await capture(page, "08_analytics.png");
  });
});
