import fs from "fs/promises";
import path from "path";
import { chromium } from "playwright";

async function capture() {
  const outputDir = path.join(process.cwd(), "public", "docs", "screenshots");
  await fs.mkdir(outputDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  console.log("📸 Capturing screenshots of live Sahara storefront...");

  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(outputDir, "01-home.png") });
  console.log("✓ 01-home.png");

  await page.goto("http://localhost:3000/product/obsidian-ceramic-tumbler", {
    waitUntil: "networkidle",
  });
  await page.screenshot({ path: path.join(outputDir, "02-product.png") });
  console.log("✓ 02-product.png");

  await page.click("button:has-text('Add to Bag')");
  await page.waitForTimeout(1000);

  await page.goto("http://localhost:3000/cart", { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(outputDir, "03-cart.png") });
  console.log("✓ 03-cart.png");

  await page.goto("http://localhost:3000/checkout", { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(outputDir, "04-checkout.png") });
  console.log("✓ 04-checkout.png");

  await page.goto("http://localhost:3000/orders/SHR-621940-8842", {
    waitUntil: "networkidle",
  });
  await page.screenshot({ path: path.join(outputDir, "05-order-tracking.png") });
  console.log("✓ 05-order-tracking.png");

  await page.goto("http://localhost:3000/auth/login", { waitUntil: "networkidle" });
  await page.fill("input[type='email']", "admin@sahara.store");
  await page.fill("input[type='password']", "SaharaAdmin2026!");
  await page.click("button:has-text('Sign In')");
  await page.waitForURL("**/admin", { timeout: 10000 });
  await page.waitForTimeout(1000);

  await page.screenshot({ path: path.join(outputDir, "06-admin-inbox.png") });
  console.log("✓ 06-admin-inbox.png");

  await page.goto("http://localhost:3000/admin/products", {
    waitUntil: "networkidle",
  });
  await page.screenshot({ path: path.join(outputDir, "07-admin-products.png") });
  console.log("✓ 07-admin-products.png");

  await page.goto("http://localhost:3000/admin/products/new", {
    waitUntil: "networkidle",
  });
  await page.screenshot({ path: path.join(outputDir, "08-admin-new-product.png") });
  console.log("✓ 08-admin-new-product.png");

  await page.goto("http://localhost:3000/docs", { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(outputDir, "09-docs.png") });
  console.log("✓ 09-docs.png");

  await browser.close();
  console.log("🎉 All 9 screenshots captured successfully!");
}

capture().catch((err) => {
  console.error("Screenshot capture error:", err);
  process.exit(1);
});
