import { expect, test } from "@playwright/test";

import { DEMO_USERS, loginAs } from "./helpers/auth";
import { clickNavLink, expectNavLink } from "./helpers/navigation";

test.describe("Role-based navigation (UC-003)", () => {
  test("nurse cannot access clinical evaluation route", async ({ page }) => {
    await loginAs(page, DEMO_USERS.nurse);

    await expectNavLink(page, "Evaluation", false);
    await expectNavLink(page, "Analytics", false);

    await page.goto("/evaluation");
    await expect(
      page.getByRole("heading", { name: /insufficient permissions/i }),
    ).toBeVisible();
  });

  test("analyst can open analytics but not evaluation", async ({ page }) => {
    await loginAs(page, DEMO_USERS.analyst);

    await expectNavLink(page, "Analytics", true);
    await expectNavLink(page, "Evaluation", false);

    await clickNavLink(page, "Analytics");
    await expect(
      page.getByRole("heading", { name: /population analytics/i }),
    ).toBeVisible();
  });
});
