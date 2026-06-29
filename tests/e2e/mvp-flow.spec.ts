import { expect, test } from "@playwright/test";

import { DEMO_USERS, loginAs } from "./helpers/auth";
import { clickNavLink } from "./helpers/navigation";

/**
 * RTS-030 — MVP demo flow:
 * login → dashboard → prediction → SHAP → simulation → history → analytics
 */
test.describe("MVP clinical flow (RTS-030)", () => {
  test("admin completes end-to-end clinical journey", async ({ page }) => {
    await loginAs(page, DEMO_USERS.admin);

    await clickNavLink(page, "Evaluation");
    await expect(
      page.getByRole("heading", { name: /clinical evaluation/i }),
    ).toBeVisible();

    await page.getByRole("button", { name: /generate ai prediction/i }).click();
    await expect(page).toHaveURL(/\/evaluation\/result/);
    await expect(
      page.getByRole("heading", { name: /prediction result/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("region", { name: /shap explainability chart/i }),
    ).toBeVisible();

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
    await expect(page.getByRole("heading", { name: /simulation summary/i })).toBeVisible();

    await clickNavLink(page, "History");
    await expect(
      page.getByRole("heading", { name: /prediction history/i }),
    ).toBeVisible();
    await expect(page.getByRole("main").getByRole("link", { name: /^view$/i }).first()).toBeVisible({
      timeout: 15_000,
    });

    await page.getByRole("main").getByRole("link", { name: /^view$/i }).first().click();
    await expect(page).toHaveURL(/\/history\/.+/);
    await expect(
      page.getByRole("heading", { name: /historical evaluation detail/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("region", { name: /shap explainability chart/i }),
    ).toBeVisible();

    await clickNavLink(page, "Analytics");
    await expect(
      page.getByRole("heading", { name: /population analytics/i }),
    ).toBeVisible();
    await expect(page.getByLabel(/analytics kpis/i)).toBeVisible();
  });
});
