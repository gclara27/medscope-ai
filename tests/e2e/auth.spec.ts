import { expect, test } from "@playwright/test";

import { DEMO_USERS, loginAs } from "./helpers/auth";
import { expectNavLink } from "./helpers/navigation";

test.describe("Authentication (UC-001)", () => {
  test("rejects invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("wrong@medscope.ai");
    await page.getByLabel("Password").fill("not-the-password");
    await page.getByRole("button", { name: /authenticate/i }).click();

    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("clinician login reaches dashboard", async ({ page }) => {
    await loginAs(page, DEMO_USERS.clinician);
    await expectNavLink(page, "Evaluation", true);
    await expectNavLink(page, "History", true);
  });
});
