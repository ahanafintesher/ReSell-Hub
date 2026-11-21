import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = process.env.BETTER_AUTH_URL?.trim() || "http://localhost:3000";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUTPUT_DIR = path.join(process.cwd(), "test-evidence", "dashboard-scroll-fix");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function getAuthCookies(role) {
  const emailMap = {
    buyer: process.env.TEST_BUYER_EMAIL,
    seller: process.env.TEST_SELLER_EMAIL,
    admin: process.env.TEST_ADMIN_EMAIL,
  };
  const email = emailMap[role];
  const res = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: BASE_URL },
    body: JSON.stringify({ email, password: process.env.TEST_ACCOUNT_PASSWORD }),
  });
  if (!res.ok) throw new Error(`Sign-in failed for ${role}: ${res.status}`);

  const rawCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get("set-cookie")];
  const cookies = [];
  for (const raw of rawCookies) {
    if (!raw) continue;
    const parts = raw.split(";")[0].split("=");
    cookies.push({
      name: parts[0].trim(),
      value: parts.slice(1).join("=").trim(),
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    });
  }
  return cookies;
}

async function captureEvidence() {
  console.log("Starting visual screenshot evidence capture for dashboard fix...");
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  try {
    // 1. Mobile Drawer open on iPhone (375x812)
    {
      const cookies = await getAuthCookies("buyer");
      const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
      await ctx.addCookies(cookies);
      const page = await ctx.newPage();
      await page.goto(`${BASE_URL}/dashboard/buyer/overview`, { waitUntil: "networkidle" });
      const hamburger = page.locator('button[aria-label="Open navigation menu"]');
      await hamburger.click();
      const drawer = page.locator('[data-slot="drawer-dialog"]');
      await drawer.waitFor({ state: "visible" });
      await page.waitForTimeout(300);
      const shotPath = path.join(OUTPUT_DIR, "01_mobile_drawer_open_375x812.png");
      await page.screenshot({ path: shotPath });
      console.log(`Saved: ${shotPath}`);
      await ctx.close();
    }

    // 2. iPad Mini Drawer open (768x1024)
    {
      const cookies = await getAuthCookies("seller");
      const ctx = await browser.newContext({ viewport: { width: 768, height: 1024 } });
      await ctx.addCookies(cookies);
      const page = await ctx.newPage();
      await page.goto(`${BASE_URL}/dashboard/seller/overview`, { waitUntil: "networkidle" });
      const hamburger = page.locator('button[aria-label="Open navigation menu"]');
      await hamburger.click();
      const drawer = page.locator('[data-slot="drawer-dialog"]');
      await drawer.waitFor({ state: "visible" });
      await page.waitForTimeout(300);
      const shotPath = path.join(OUTPUT_DIR, "02_ipad_mini_drawer_open_768x1024.png");
      await page.screenshot({ path: shotPath });
      console.log(`Saved: ${shotPath}`);
      await ctx.close();
    }

    // 3. Desktop Desktop Sidebar + Content Scrolled Independently (Admin Users 1440x900)
    {
      const cookies = await getAuthCookies("admin");
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      await ctx.addCookies(cookies);
      const page = await ctx.newPage();
      await page.goto(`${BASE_URL}/dashboard/admin/users`, { waitUntil: "networkidle" });
      await page.waitForSelector("#dashboard-sidebar");
      const mainContent = page.locator("#dashboard-main-content");
      await mainContent.evaluate((el) => { el.scrollTop = 450; });
      await page.waitForTimeout(300);
      const shotPath = path.join(OUTPUT_DIR, "03_desktop_admin_users_scrolled_1440x900.png");
      await page.screenshot({ path: shotPath });
      console.log(`Saved: ${shotPath}`);
      await ctx.close();
    }

    // 4. Desktop Buyer Orders (1280x800)
    {
      const cookies = await getAuthCookies("buyer");
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      await ctx.addCookies(cookies);
      const page = await ctx.newPage();
      await page.goto(`${BASE_URL}/dashboard/buyer/orders`, { waitUntil: "networkidle" });
      await page.waitForSelector("#dashboard-sidebar");
      const shotPath = path.join(OUTPUT_DIR, "04_desktop_buyer_orders_1280x800.png");
      await page.screenshot({ path: shotPath });
      console.log(`Saved: ${shotPath}`);
      await ctx.close();
    }

    // 5. Desktop Seller Products (1920x1080 Wide)
    {
      const cookies = await getAuthCookies("seller");
      const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
      await ctx.addCookies(cookies);
      const page = await ctx.newPage();
      await page.goto(`${BASE_URL}/dashboard/seller/products/my-products`, { waitUntil: "networkidle" });
      await page.waitForSelector("#dashboard-sidebar");
      const shotPath = path.join(OUTPUT_DIR, "05_wide_desktop_seller_products_1920x1080.png");
      await page.screenshot({ path: shotPath });
      console.log(`Saved: ${shotPath}`);
      await ctx.close();
    }

    // 6. Mobile Small (320x568) Closed Drawer Overview
    {
      const cookies = await getAuthCookies("buyer");
      const ctx = await browser.newContext({ viewport: { width: 320, height: 568 } });
      await ctx.addCookies(cookies);
      const page = await ctx.newPage();
      await page.goto(`${BASE_URL}/dashboard/buyer/overview`, { waitUntil: "networkidle" });
      const shotPath = path.join(OUTPUT_DIR, "06_small_mobile_buyer_overview_320x568.png");
      await page.screenshot({ path: shotPath });
      console.log(`Saved: ${shotPath}`);
      await ctx.close();
    }

    console.log("All visual evidence screenshots captured successfully!");
  } finally {
    await browser.close();
  }
}

captureEvidence().catch((err) => {
  console.error(err);
  process.exit(1);
});
