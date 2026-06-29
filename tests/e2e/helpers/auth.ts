import { expect, type Page } from "@playwright/test";

export const DEMO_PASSWORD = "MedScope123!";

export const DEMO_USERS = {
  admin: "admin@medscope.ai",
  clinician: "clinician@medscope.ai",
  analyst: "analyst@medscope.ai",
  nurse: "nurse@medscope.ai",
} as const;

export async function loginAs(
  page: Page,
  email: string,
  password: string = DEMO_PASSWORD,
): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /authenticate/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(
    page.getByRole("heading", { name: /clinical dashboard/i }),
  ).toBeVisible();
}

export async function logout(page: Page): Promise<void> {
  await page.getByRole("button", { name: /log out/i }).click();
  await expect(page).toHaveURL(/\/login/);
}
