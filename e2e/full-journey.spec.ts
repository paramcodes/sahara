import { expect, test } from "@playwright/test";

test("full journey smoke", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Everyday Essentials/i })).toBeVisible();
  const first = page.locator('a[href^="/product/"]').first();
  if (await first.count()) {
    await first.click();
    await expect(page).toHaveURL(/\/product\//);
  }
});
