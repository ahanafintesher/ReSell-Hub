import { chromium } from "playwright";

async function run() {
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto("http://localhost:3000/auth/login", { waitUntil: "networkidle" });
  await page.locator('input[type="email"]').first().fill("e2e_admin@resellhub.test");
  await page.locator('input[type="password"]').first().fill("Password123!");
  await Promise.all([
    page.waitForResponse((r) => r.url().includes("/api/auth/sign-in/email") && r.status() === 200),
    page.locator('button[type="submit"]').first().click(),
  ]);
  await page.waitForTimeout(1500);

  await page.goto("http://localhost:3000/dashboard/admin/analytics", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  const kpis = await page.locator('text=Settled Volume, text=Total Orders, text=Active Listings').count();
  const recharts = await page.locator(".recharts-responsive-container, .recharts-surface").count();
  const table = await page.locator("text=Inventory Valuation by Category").count();

  console.log("Admin Analytics KPIs count:", kpis);
  console.log("Recharts components count:", recharts);
  console.log("Category Valuation table count:", table);

  // Check Seller Analytics as well
  await page.goto("http://localhost:3000/dashboard/seller/analytics", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  const sellerKpis = await page.locator("text=Gross Revenue, text=Total Orders, text=Active Listings").count();
  const sellerRecharts = await page.locator(".recharts-responsive-container, .recharts-surface").count();
  console.log("Seller Analytics KPIs count:", sellerKpis);
  console.log("Seller Recharts count:", sellerRecharts);

  await browser.close();
}

run().catch(console.error);
