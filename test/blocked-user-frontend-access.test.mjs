import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

// Load environment variables safely
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const BASE_URL = process.env.BETTER_AUTH_URL?.trim() || "http://localhost:3000";
const BACKEND_URL = (process.env.RESELL_SERVER_URL || process.env.NEXT_PUBLIC_RESELL_SERVER_URL || "http://localhost:5000").replace(/\/$/, "");
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const TEST_BUYER_EMAIL = process.env.TEST_BUYER_EMAIL || "e2e_buyer@resellhub.test";
const TEST_SELLER_EMAIL = process.env.TEST_SELLER_EMAIL || "e2e_seller@resellhub.test";
const TEST_ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || "e2e_admin@resellhub.test";
const TEST_ACCOUNT_PASSWORD = process.env.TEST_ACCOUNT_PASSWORD;

if (!TEST_ACCOUNT_PASSWORD) {
  throw new Error("TEST_ACCOUNT_PASSWORD must be configured in .env");
}

async function safeFetch(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      if ((err.code === "ECONNRESET" || err.code === "ECONNREFUSED" || err.message?.includes("fetch failed")) && i < retries - 1) {
        await new Promise((r) => setTimeout(r, 200 * (i + 1)));
        continue;
      }
      throw err;
    }
  }
}

async function getAuthContext(email, password) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const loginRes = await safeFetch(`${BASE_URL}/api/auth/sign-in/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: BASE_URL },
      body: JSON.stringify({ email, password }),
    });
    if (loginRes.status === 429) {
      // Backoff if rate limited
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      continue;
    }
    if (!loginRes.ok) {
      throw new Error(`Login failed for ${email}: ${loginRes.status}`);
    }
    const cookieHeader = loginRes.headers.get("set-cookie");
    const tokenRes = await safeFetch(`${BASE_URL}/api/auth/token`, {
      headers: { Cookie: cookieHeader },
    });
    const data = await tokenRes.json();
    return {
      cookieHeader,
      token: data.token,
    };
  }
  throw new Error(`Exceeded login retry attempts for ${email}`);
}

async function parseCookies(cookieHeader) {
  if (!cookieHeader) return [];
  return cookieHeader.split(/,\s*(?=[a-zA-Z0-9_-]+=)/).map((c) => {
    const parts = c.split(";")[0].split("=");
    return {
      name: parts[0].trim(),
      value: parts.slice(1).join("=").trim(),
      domain: "localhost",
      path: "/",
    };
  });
}

async function setAdminUserStatus(adminToken, userEmail, status) {
  const usersRes = await safeFetch(`${BACKEND_URL}/api/admin/users`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const users = await usersRes.json();
  const targetUser = users.find((u) => u.email === userEmail);
  if (!targetUser) throw new Error(`User not found: ${userEmail}`);

  const updateRes = await safeFetch(`${BACKEND_URL}/api/admin/users/${targetUser._id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status }),
  });
  assert.equal(updateRes.status, 200);
  return targetUser._id;
}

async function getAvailableProductId() {
  const res = await safeFetch(`${BACKEND_URL}/api/products?limit=5`);
  const products = await res.json();
  const list = Array.isArray(products) ? products : products.products || [];
  const available = list.find((p) => p.status === "available");
  if (!available) throw new Error("No available product found for testing");
  return available._id;
}

test.describe("ReSell Hub Frontend — Blocked User Access Restriction & Redirect", () => {
  let browser;
  let adminToken;
  let adminCookies;
  let buyerToken;
  let buyerCookies;
  let sellerCookies;
  let sampleProductId;

  test.before(async () => {
    browser = await chromium.launch({
      executablePath: CHROME_PATH,
      headless: true,
    });

    const adminAuth = await getAuthContext(TEST_ADMIN_EMAIL, TEST_ACCOUNT_PASSWORD);
    adminToken = adminAuth.token;
    adminCookies = await parseCookies(adminAuth.cookieHeader);

    // Initial delay to avoid Better Auth rate-limiter trigger
    await new Promise((r) => setTimeout(r, 600));

    const buyerAuth = await getAuthContext(TEST_BUYER_EMAIL, TEST_ACCOUNT_PASSWORD);
    buyerToken = buyerAuth.token;
    buyerCookies = await parseCookies(buyerAuth.cookieHeader);

    await new Promise((r) => setTimeout(r, 600));

    const sellerAuth = await getAuthContext(TEST_SELLER_EMAIL, TEST_ACCOUNT_PASSWORD);
    sellerCookies = await parseCookies(sellerAuth.cookieHeader);

    sampleProductId = await getAvailableProductId();

    // Ensure all test accounts start in active status
    await setAdminUserStatus(adminToken, TEST_BUYER_EMAIL, "active");
    await setAdminUserStatus(adminToken, TEST_SELLER_EMAIL, "active");
  });

  test.after(async () => {
    // Teardown: ensure buyer and seller are restored to active status
    if (adminToken) {
      await setAdminUserStatus(adminToken, TEST_BUYER_EMAIL, "active");
      await setAdminUserStatus(adminToken, TEST_SELLER_EMAIL, "active");
    }
    if (browser) {
      await browser.close();
    }
  });

  test("1. Active buyer can access Product Details and Buyer Dashboard", async () => {
    const context = await browser.newContext();
    await context.addCookies(buyerCookies);
    const page = await context.newPage();

    // 1.1 Access Product Details
    await page.goto(`${BASE_URL}/products/${sampleProductId}`);
    await page.waitForLoadState("networkidle");
    assert.ok(!page.url().includes("/account/blocked"), "Active buyer must not be redirected to /account/blocked");
    const heading = await page.locator("h1").first().textContent();
    assert.ok(heading && heading.length > 0, "Product title heading should be rendered");

    // 1.2 Access Buyer Dashboard
    await page.goto(`${BASE_URL}/dashboard/buyer/overview`);
    await page.waitForLoadState("networkidle");
    assert.ok(page.url().includes("/dashboard/buyer/overview"), "Active buyer should remain on buyer dashboard");
    const sidebar = page.locator("aside, #dashboard-sidebar, nav");
    assert.ok((await sidebar.count()) > 0, "Dashboard sidebar should be visible to active buyer");

    await context.close();
  });

  test("2. Active seller can access Seller Dashboard", async () => {
    const context = await browser.newContext();
    await context.addCookies(sellerCookies);
    const page = await context.newPage();

    await page.goto(`${BASE_URL}/dashboard/seller/overview`);
    await page.waitForLoadState("networkidle");
    assert.ok(page.url().includes("/dashboard/seller"), "Active seller should access seller dashboard");
    assert.ok(!page.url().includes("/account/blocked"));

    await context.close();
  });

  test("3. Active admin can access Admin Dashboard", async () => {
    const context = await browser.newContext();
    await context.addCookies(adminCookies);
    const page = await context.newPage();

    await page.goto(`${BASE_URL}/dashboard/admin/overview`);
    await page.waitForLoadState("networkidle");
    assert.ok(page.url().includes("/dashboard/admin"), "Active admin should access admin dashboard");
    assert.ok(!page.url().includes("/account/blocked"));

    await context.close();
  });

  test("4. Backend returns 403 ACCOUNT_BLOCKED for a blocked user", async () => {
    // Block buyer
    await setAdminUserStatus(adminToken, TEST_BUYER_EMAIL, "blocked");

    const profileRes = await safeFetch(`${BACKEND_URL}/api/users/profile`, {
      headers: { Authorization: `Bearer ${buyerToken}` },
    });

    assert.equal(profileRes.status, 403, "Backend must return HTTP 403 for blocked user");
    const errorBody = await profileRes.json();
    assert.equal(errorBody.success, false);
    assert.equal(errorBody.code, "ACCOUNT_BLOCKED");
    assert.equal(errorBody.message, "Your account has been blocked by an administrator.");

    // Unblock for subsequent tests
    await setAdminUserStatus(adminToken, TEST_BUYER_EMAIL, "active");
  });

  test("5. Frontend redirects blocked users to /account/blocked", async () => {
    // 1. Administrator blocks buyer in MongoDB
    await setAdminUserStatus(adminToken, TEST_BUYER_EMAIL, "blocked");

    const context = await browser.newContext();
    await context.addCookies(buyerCookies);
    const page = await context.newPage();

    // 2. User attempts to visit dashboard
    await page.goto(`${BASE_URL}/dashboard/buyer/overview`);
    await page.waitForURL("**/account/blocked", { timeout: 10000 });

    assert.ok(page.url().includes("/account/blocked"), "Blocked user must be redirected to /account/blocked");

    // 3. Validate exact required text elements on /account/blocked
    const heading = await page.locator("h1").textContent();
    assert.equal(heading.trim(), "You Have Been Blocked by Admin");

    const expectedDesc = "Your account has been blocked by an administrator. You no longer have permission to access protected areas of this website. If you believe this action was taken by mistake, please contact the website administrator.";
    const pageContent = await page.textContent("body");
    assert.ok(pageContent.includes(expectedDesc), "Page must display the exact required description");

    await context.close();
    await setAdminUserStatus(adminToken, TEST_BUYER_EMAIL, "active");
  });

  test("6. Blocked user cannot view Product Details content", async () => {
    // Block buyer
    await setAdminUserStatus(adminToken, TEST_BUYER_EMAIL, "blocked");

    const context = await browser.newContext();
    await context.addCookies(buyerCookies);
    const page = await context.newPage();

    // Direct navigation to product details
    await page.goto(`${BASE_URL}/products/${sampleProductId}`);
    await page.waitForURL("**/account/blocked", { timeout: 10000 });

    assert.ok(page.url().includes("/account/blocked"), "Direct URL navigation must redirect to /account/blocked");

    // Ensure product details content did not render
    const bodyText = await page.textContent("body");
    assert.ok(!bodyText.includes("Asking Price:"), "Product details content must not be rendered to blocked user");
    assert.ok(!bodyText.includes("Verified Seller"), "Seller information must not be leaked to blocked user");

    await context.close();
    await setAdminUserStatus(adminToken, TEST_BUYER_EMAIL, "active");
  });

  test("7. Blocked user cannot view any dashboard content or sidebar", async () => {
    // Block buyer
    await setAdminUserStatus(adminToken, TEST_BUYER_EMAIL, "blocked");

    const context = await browser.newContext();
    await context.addCookies(buyerCookies);
    const page = await context.newPage();

    // Test nested routes under dashboard
    const nestedRoutes = [
      "/dashboard",
      "/dashboard/buyer/overview",
      "/dashboard/buyer/orders",
      "/dashboard/buyer/wishlist",
      "/dashboard/buyer/profile",
      "/dashboard/settings",
    ];

    for (const route of nestedRoutes) {
      await page.goto(`${BASE_URL}${route}`);
      await page.waitForURL("**/account/blocked", { timeout: 10000 });
      assert.ok(page.url().includes("/account/blocked"), `Route ${route} must redirect blocked user to /account/blocked`);

      // Verify no sidebar or dashboard content
      const sidebarLinks = page.locator('aside a, nav[aria-label="Dashboard navigation"]');
      assert.equal(await sidebarLinks.count(), 0, `No dashboard navigation sidebar allowed on ${route}`);
    }

    await context.close();
    await setAdminUserStatus(adminToken, TEST_BUYER_EMAIL, "active");
  });

  test("8. Direct URL, refresh, browser back/forward, and new-tab navigation are handled", async () => {
    await setAdminUserStatus(adminToken, TEST_BUYER_EMAIL, "blocked");

    const context = await browser.newContext();
    await context.addCookies(buyerCookies);
    const page = await context.newPage();

    // 8.1 Direct URL
    await page.goto(`${BASE_URL}/products/${sampleProductId}`);
    await page.waitForURL("**/account/blocked", { timeout: 10000 });
    assert.ok(page.url().includes("/account/blocked"), "Direct URL redirected");

    // 8.2 Browser Refresh on /products/:id
    await page.goto(`${BASE_URL}/products/${sampleProductId}`);
    await page.reload();
    await page.waitForURL("**/account/blocked", { timeout: 10000 });
    assert.ok(page.url().includes("/account/blocked"), "Refresh redirected");

    // 8.3 Browser Back/Forward navigation
    await page.goto(`${BASE_URL}/`); // Go to home
    await page.waitForLoadState("networkidle");
    await page.goto(`${BASE_URL}/dashboard/buyer/orders`); // Redirects to /account/blocked
    await page.waitForURL("**/account/blocked", { timeout: 10000 });
    await page.goBack(); // Navigates back towards home
    await page.waitForLoadState("networkidle");
    await page.goForward(); // Navigates forward to blocked page
    await page.waitForURL("**/account/blocked", { timeout: 10000 });
    assert.ok(page.url().includes("/account/blocked"), "Forward navigation lands on /account/blocked");

    // 8.4 New-tab navigation with stale session
    const newPage = await context.newPage();
    await newPage.goto(`${BASE_URL}/dashboard/buyer/overview`);
    await newPage.waitForURL("**/account/blocked", { timeout: 10000 });
    assert.ok(newPage.url().includes("/account/blocked"), "New tab with stale session redirected");
    await newPage.close();

    await context.close();
    await setAdminUserStatus(adminToken, TEST_BUYER_EMAIL, "active");
  });

  test("9. Anonymous visitors can still browse public pages", async () => {
    const context = await browser.newContext(); // No cookies = anonymous
    const page = await context.newPage();

    // 9.1 Home page
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState("networkidle");
    assert.equal(page.url(), `${BASE_URL}/`);

    // 9.2 Products catalog
    await page.goto(`${BASE_URL}/products`);
    await page.waitForLoadState("networkidle");
    assert.ok(page.url().includes("/products"));

    // 9.3 Categories page
    await page.goto(`${BASE_URL}/categories`);
    await page.waitForLoadState("networkidle");
    assert.ok(page.url().includes("/categories"));

    // 9.4 Single Product Details (anonymous visitor can view)
    await page.goto(`${BASE_URL}/products/${sampleProductId}`);
    await page.waitForLoadState("networkidle");
    assert.ok(!page.url().includes("/account/blocked"), "Anonymous visitor must not be blocked");
    assert.ok(page.url().includes(`/products/${sampleProductId}`));

    await context.close();
  });

  test("10. Unblocked users regain access according to their roles", async () => {
    // 1. Block user
    await setAdminUserStatus(adminToken, TEST_BUYER_EMAIL, "blocked");

    const context = await browser.newContext();
    await context.addCookies(buyerCookies);
    const page = await context.newPage();

    // Verify blocked initially
    await page.goto(`${BASE_URL}/dashboard/buyer/overview`);
    await page.waitForURL("**/account/blocked", { timeout: 10000 });
    assert.ok(page.url().includes("/account/blocked"));

    // 2. Admin unblocks user (sets status: "active")
    await setAdminUserStatus(adminToken, TEST_BUYER_EMAIL, "active");

    // 3. Buyer re-attempts dashboard access
    await page.goto(`${BASE_URL}/dashboard/buyer/overview`);
    await page.waitForLoadState("networkidle");
    assert.ok(page.url().includes("/dashboard/buyer/overview"), "Unblocked buyer regains access to dashboard");
    assert.ok(!page.url().includes("/account/blocked"), "Unblocked buyer must not be on /account/blocked");

    // 4. Buyer re-attempts product details access
    await page.goto(`${BASE_URL}/products/${sampleProductId}`);
    await page.waitForLoadState("networkidle");
    assert.ok(page.url().includes(`/products/${sampleProductId}`), "Unblocked buyer regains access to product details");
    assert.ok(!page.url().includes("/account/blocked"));

    await context.close();
  });

  test("11. The Return to Home Page button works", async () => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to /account/blocked
    await page.goto(`${BASE_URL}/account/blocked`);
    await page.waitForLoadState("networkidle");

    // Find and click the Return to Home Page button
    const returnBtn = page.getByRole("button", { name: /Return to Home Page/i });
    assert.ok((await returnBtn.count()) > 0, "Return to Home Page button must exist");

    await returnBtn.click();
    await page.waitForURL(`${BASE_URL}/`, { timeout: 10000 });
    assert.equal(page.url(), `${BASE_URL}/`, "Return to Home Page button must navigate to /");

    await context.close();
  });

  test("12. No redirect loops or hydration errors occur", async () => {
    const context = await browser.newContext();
    const page = await context.newPage();

    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // 12.1 Direct visit to /account/blocked should not redirect loop
    const response = await page.goto(`${BASE_URL}/account/blocked`);
    assert.equal(response.status(), 200, "Direct visit to /account/blocked must return 200 OK");
    await page.waitForLoadState("networkidle");
    assert.ok(page.url().includes("/account/blocked"), "Should stay on /account/blocked without redirecting");

    // 12.2 Verify no hydration mismatch errors
    const hydrationErrors = consoleErrors.filter((e) =>
      e.toLowerCase().includes("hydration") ||
      e.toLowerCase().includes("did not match")
    );
    assert.equal(hydrationErrors.length, 0, `Hydration errors detected: ${hydrationErrors.join(", ")}`);

    await context.close();
  });
});
