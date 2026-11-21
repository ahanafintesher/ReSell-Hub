import { chromium } from "playwright";
import fs from "fs";
import path from "path";

// Auto-load .env for standalone script execution
const envPath = path.resolve(".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const TEST_ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || "e2e_admin@resellhub.test";
const TEST_ACCOUNT_PASSWORD = process.env.TEST_ACCOUNT_PASSWORD;

const SCREENSHOT_DIR = path.resolve("test-evidence/screenshots/responsive");
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const VIEWPORTS = [
  // Mobile
  { name: "mobile_320x568", width: 320, height: 568, category: "Mobile" },
  { name: "mobile_375x812", width: 375, height: 812, category: "Mobile" },
  { name: "mobile_390x844", width: 390, height: 844, category: "Mobile" },
  { name: "mobile_430x932", width: 430, height: 932, category: "Mobile" },
  // Tablet
  { name: "tablet_768x1024", width: 768, height: 1024, category: "Tablet" },
  { name: "tablet_820x1180", width: 820, height: 1180, category: "Tablet" },
  { name: "tablet_1024x768", width: 1024, height: 768, category: "Tablet" },
  // Desktop
  { name: "desktop_1280x720", width: 1280, height: 720, category: "Desktop" },
  { name: "desktop_1366x768", width: 1366, height: 768, category: "Desktop" },
  { name: "desktop_1440x900", width: 1440, height: 900, category: "Desktop" },
  { name: "desktop_1920x1080", width: 1920, height: 1080, category: "Desktop" },
];

const ROUTES_TO_TEST = [
  { name: "Home Landing", path: "/" },
  { name: "All Products Grid", path: "/products" },
  { name: "Shopping Cart", path: "/cart" },
  { name: "Checkout Page", path: "/checkout" },
  { name: "Buyer Orders", path: "/dashboard/buyer/orders" },
  { name: "Seller Overview", path: "/dashboard/seller/overview" },
  { name: "Seller My Products", path: "/dashboard/seller/products/my-products" },
  { name: "Admin Overview", path: "/dashboard/admin/overview" },
  { name: "Admin Payments", path: "/dashboard/admin/payments" },
];

async function runResponsiveTests() {
  console.log("=== STARTING PHASE 4: RESPONSIVE TESTING ACROSS 11 VIEWPORTS ===");
  const results = [];
  const overflowIssues = [];

  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // Log in as admin to have access to all routes during viewport sampling
  await page.goto("http://localhost:3000/auth/login", { waitUntil: "networkidle" });
  await page.locator('input[name="email"], input[type="email"]').first().fill(TEST_ADMIN_EMAIL);
  await page.locator('input[name="password"], input[type="password"]').first().fill(TEST_ACCOUNT_PASSWORD);
  await Promise.all([
    page.waitForResponse((r) => r.url().includes("/api/auth/sign-in/email") && r.status() === 200),
    page.locator('button[type="submit"]:has-text("Login"), button[type="submit"]').first().click(),
  ]);
  await page.waitForTimeout(2000);

  for (const vp of VIEWPORTS) {
    console.log(`\nTesting Viewport: ${vp.name} (${vp.width}x${vp.height}) [${vp.category}]`);
    await page.setViewportSize({ width: vp.width, height: vp.height });

    for (const route of ROUTES_TO_TEST) {
      try {
        await page.goto(`http://localhost:3000${route.path}`, { waitUntil: "networkidle" });
        await page.waitForTimeout(500);

        // Check horizontal overflow
        const overflow = await page.evaluate(() => {
          const docWidth = document.documentElement.scrollWidth;
          const winWidth = window.innerWidth;
          return {
            hasOverflow: docWidth > winWidth + 2, // 2px margin for subpixel rounding
            docWidth,
            winWidth,
            diff: docWidth - winWidth,
          };
        });

        const screenshotName = `${vp.name}_${route.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}.png`;
        const screenshotPath = path.join(SCREENSHOT_DIR, screenshotName);

        // Save representative screenshots for mobile 375, tablet 768, desktop 1280
        if (vp.width === 375 || vp.width === 768 || vp.width === 1280) {
          await page.screenshot({ path: screenshotPath, fullPage: false });
        }

        const isPass = !overflow.hasOverflow;
        const resultItem = {
          viewport: vp.name,
          category: vp.category,
          dimensions: `${vp.width}x${vp.height}`,
          route: route.path,
          routeName: route.name,
          hasHorizontalOverflow: overflow.hasOverflow,
          scrollWidth: overflow.docWidth,
          innerWidth: overflow.winWidth,
          status: isPass ? "PASS" : "FAIL",
          screenshot: (vp.width === 375 || vp.width === 768 || vp.width === 1280) ? `test-evidence/screenshots/responsive/${screenshotName}` : null,
        };

        results.push(resultItem);
        if (overflow.hasOverflow) {
          console.warn(`  [OVERFLOW] ${route.name} at ${vp.width}px: scrollWidth=${overflow.docWidth}px > innerWidth=${overflow.winWidth}px (+${overflow.diff}px)`);
          overflowIssues.push({ route: route.path, viewport: vp.name, diff: overflow.diff });
        } else {
          process.stdout.write(".");
        }
      } catch (err) {
        console.error(`  Error testing ${route.name} at ${vp.name}:`, err.message);
      }
    }
  }

  await browser.close();

  fs.writeFileSync("test-evidence/responsive-test-results.json", JSON.stringify(results, null, 2));
  console.log(`\n=== RESPONSIVE TESTING COMPLETED ===`);
  console.log(`Total Checks: ${results.length}`);
  console.log(`Passed: ${results.filter(r => r.status === "PASS").length}`);
  console.log(`Failed: ${results.filter(r => r.status === "FAIL").length}`);
  console.log(`Overflow Issues:`, overflowIssues);

  return { results, overflowIssues };
}

runResponsiveTests().catch(console.error);
