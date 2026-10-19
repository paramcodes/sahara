import { execSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

async function capture() {
  const outputDir = path.join(process.cwd(), "public", "docs", "screenshots");
  const tempVideoDir = path.join(outputDir, "video_temp");
  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(tempVideoDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
    recordVideo: {
      dir: tempVideoDir,
      size: { width: 1280, height: 800 },
    },
  });

  const page = await context.newPage();

  console.log("📸 Driving Sahara application and capturing media...");

  // 1. Homepage
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outputDir, "01-home.png") });
  console.log("✓ 01-home.png");

  // Scroll through catalog
  await page.evaluate(() => window.scrollBy({ top: 500, behavior: "smooth" }));
  await page.waitForTimeout(600);

  // 2. Product Detail Page
  await page.goto("http://localhost:3000/product/obsidian-ceramic-tumbler", {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outputDir, "02-product.png") });
  console.log("✓ 02-product.png");

  // Add to bag
  const addBtn = page.locator("button:has-text('Add to Bag')");
  if (await addBtn.isVisible()) {
    await addBtn.click();
    await page.waitForTimeout(800);
  }

  // 3. Cart Page
  await page.goto("http://localhost:3000/cart", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outputDir, "03-cart.png") });
  console.log("✓ 03-cart.png");

  // 4. Checkout Page
  await page.goto("http://localhost:3000/checkout", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outputDir, "04-checkout.png") });
  console.log("✓ 04-checkout.png");

  // Fill sample checkout inputs for realistic visual
  const nameInput = page.locator("input[placeholder*='name' i], input[name='name']");
  if (await nameInput.isVisible()) {
    await nameInput.fill("Claire Dupont");
  }
  const phoneInput = page.locator("input[placeholder*='phone' i], input[name='phone']");
  if (await phoneInput.isVisible()) {
    await phoneInput.fill("+1 (555) 382-9102");
  }
  const addressInput = page.locator("textarea[placeholder*='address' i], textarea[name='address']");
  if (await addressInput.isVisible()) {
    await addressInput.fill("742 Evergreen Terrace, Suite 4B, Springfield");
  }
  await page.waitForTimeout(600);

  // 5. Order Tracking Page
  await page.goto("http://localhost:3000/orders/SHR-621940-8842", {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outputDir, "05-order-tracking.png") });
  console.log("✓ 05-order-tracking.png");

  // 6. Admin Sign In
  await page.goto("http://localhost:3000/auth/login", { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.fill("input[type='email']", "admin@sahara.store");
  await page.fill("input[type='password']", "SaharaAdmin2026!");
  await page.click("button:has-text('Sign In')");
  await page.waitForURL("**/admin", { timeout: 15000 });
  await page.waitForTimeout(800);

  // 7. Admin Orders Inbox
  await page.screenshot({ path: path.join(outputDir, "06-admin-inbox.png") });
  console.log("✓ 06-admin-inbox.png");

  // 8. Admin Products Table
  await page.goto("http://localhost:3000/admin/products", {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outputDir, "07-admin-products.png") });
  console.log("✓ 07-admin-products.png");

  // 9. Admin Add Product
  await page.goto("http://localhost:3000/admin/products/new", {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outputDir, "08-admin-new-product.png") });
  console.log("✓ 08-admin-new-product.png");

  // 10. Documentation Page
  await page.goto("http://localhost:3000/docs", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outputDir, "09-docs.png") });
  console.log("✓ 09-docs.png");

  // Finish video recording
  const video = page.video();
  await page.close();
  await context.close();
  await browser.close();

  if (video) {
    const rawVideoPath = await video.path();
    console.log(`🎥 Raw video recorded at: ${rawVideoPath}`);

    const mp4Path = path.join(outputDir, "sahara-demo.mp4");
    const gifPath = path.join(outputDir, "sahara-walkthrough.gif");

    console.log("⚙️  Converting to high-definition MP4 (sahara-demo.mp4)...");
    execSync(
      `ffmpeg -y -i "${rawVideoPath}" -c:v libx264 -pix_fmt yuv420p -movflags +faststart -crf 22 -preset medium "${mp4Path}"`,
      { stdio: "inherit" },
    );
    console.log("✓ sahara-demo.mp4 generated!");

    console.log("⚙️  Generating optimized walkthrough GIF (sahara-walkthrough.gif)...");
    execSync(
      `ffmpeg -y -i "${mp4Path}" -vf "fps=10,scale=850:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=96[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3" "${gifPath}"`,
      { stdio: "inherit" },
    );
    console.log("✓ sahara-walkthrough.gif generated!");
  }

  // Clean up temp video directory
  await fs.rm(tempVideoDir, { recursive: true, force: true });
  console.log("🎉 All 9 screenshots, MP4 demo, and walkthrough GIF generated successfully!");
}

capture().catch((err) => {
  console.error("Screenshot capture error:", err);
  process.exit(1);
});
