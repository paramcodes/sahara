import { expect, test } from "@playwright/test";

test.use({ colorScheme: "dark" });

test("reduced motion keeps content visible", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Everyday Essentials/i })).toBeVisible();
});
