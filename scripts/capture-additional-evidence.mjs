import { chromium } from "playwright";
import path from "path";

const BASE_URL = "http://localhost:3000";
const AFTER_DIR = path.resolve("test-evidence/browser-qa/after-fixes");
const DASH_DIR = path.resolve("test-evidence/browser-qa/dashboard");

async function capture() {
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  // 1. Homepage with Featured Listings
  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(AFTER_DIR, "homepage_featured_listings_active.png") });
  console.log("Captured homepage_featured_listings_active.png");

  // 2. Product Details and Report Modal
  await page.goto(`${BASE_URL}/products`, { waitUntil: "networkidle" });
  const firstProdLink = page.locator('a[href*="/products/"]').first();
  await firstProdLink.click();
  await page.waitForTimeout(1000);

  // Click report button
  const reportBtn = page.locator('button[aria-label="Report this listing"]').first();
  if (await reportBtn.isVisible()) {
    // Need to login first to open modal
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: "networkidle" });
    await page.locator('input[type="email"]').first().fill("e2e_buyer@resellhub.test");
    await page.locator('input[type="password"]').first().fill("Password123!");
    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/auth/sign-in/email") && r.status() === 200),
      page.locator('button[type="submit"]').first().click(),
    ]);
    await page.waitForTimeout(1500);

    // Return to product details
    await page.goto(`${BASE_URL}/products`, { waitUntil: "networkidle" });
    await page.locator('a[href*="/products/"]').first().click();
    await page.waitForTimeout(1000);

    const reportBtnAuth = page.locator('button[aria-label="Report this listing"]').first();
    if (await reportBtnAuth.isVisible()) {
      await reportBtnAuth.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(AFTER_DIR, "report_modal_active.png") });
      console.log("Captured report_modal_active.png");
    }
  }

  // 3. Admin Block Dialog
  await page.goto(`${BASE_URL}/auth/login`, { waitUntil: "networkidle" });
  await page.locator('input[type="email"]').first().fill("e2e_admin@resellhub.test");
  await page.locator('input[type="password"]').first().fill("Password123!");
  await Promise.all([
    page.waitForResponse((r) => r.url().includes("/api/auth/sign-in/email") && r.status() === 200),
    page.locator('button[type="submit"]').first().click(),
  ]);
  await page.waitForTimeout(1500);

  await page.goto(`${BASE_URL}/dashboard/admin/users`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const blockBtn = page.locator('button:has-text("Block")').first();
  if (await blockBtn.isVisible()) {
    await blockBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(AFTER_DIR, "admin_block_dialog_active.png") });
    await page.screenshot({ path: path.join(DASH_DIR, "admin_user_block_alertdialog.png") });
    console.log("Captured admin_block_dialog_active.png");
  }

  // 4. Checkout page
  await page.goto(`${BASE_URL}/checkout`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(AFTER_DIR, "checkout_page_verified.png") });
  console.log("Captured checkout_page_verified.png");

  await browser.close();
}

capture().catch(console.error);
