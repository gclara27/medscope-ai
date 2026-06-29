import { expect, type Locator, type Page } from "@playwright/test";

/** Primary app sidebar (desktop layout in Playwright Desktop Chrome). */
export function sidebarNav(page: Page): Locator {
  return page.locator("aside").first().getByRole("navigation");
}

export function navLink(page: Page, label: string): Locator {
  return sidebarNav(page).getByRole("link", { name: label, exact: true });
}

export async function clickNavLink(page: Page, label: string): Promise<void> {
  await navLink(page, label).click();
}

export async function expectNavLink(
  page: Page,
  label: string,
  visible: boolean,
): Promise<void> {
  const link = navLink(page, label);
  if (visible) {
    await expect(link).toBeVisible();
  } else {
    await expect(link).toHaveCount(0);
  }
}
