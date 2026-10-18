import { expect, test } from "@playwright/test";

test("home survives reload", async ({ page }) => {
  await page.goto("/");
  await page.reload();
  await expect(page.getByRole("heading", { name: /Everyday Essentials/i })).toBeVisible();
});
