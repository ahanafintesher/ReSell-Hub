import test from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";

const BASE_URL = process.env.BETTER_AUTH_URL?.trim() || "http://localhost:3000";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const VIEWPORTS = [
  { name: "Small Mobile", width: 320, height: 568, isMobile: true },
  { name: "Mobile (iPhone X)", width: 375, height: 812, isMobile: true },
  { name: "Mobile (iPhone 12/13/14)", width: 390, height: 844, isMobile: true },
  { name: "Large Mobile (Pro Max)", width: 430, height: 932, isMobile: true },
  { name: "iPad Mini / Tablet", width: 768, height: 1024, isMobile: true },
  { name: "Tablet / Small Laptop", width: 1024, height: 768, isMobile: false },
  { name: "Desktop", width: 1280, height: 800, isMobile: false },
  { name: "Large Desktop", width: 1440, height: 900, isMobile: false },
  { name: "Wide Desktop", width: 1920, height: 1080, isMobile: false },
];

const ROUTE_CONFIGS = {
  buyer: [
    { name: "Overview", path: "/dashboard/buyer/overview" },
    { name: "My Orders", path: "/dashboard/buyer/orders" },
    { name: "Wishlist", path: "/dashboard/buyer/wishlist" },
    { name: "Payment History", path: "/dashboard/buyer/payment-history" },
    { name: "Profile", path: "/dashboard/buyer/profile" },
    { name: "Settings", path: "/dashboard/settings" },
  ],
  seller: [
    { name: "Overview", path: "/dashboard/seller/overview" },
    { name: "Add Product", path: "/dashboard/seller/products/add-products" },
    { name: "My Products", path: "/dashboard/seller/products/my-products" },
    { name: "Manage Orders", path: "/dashboard/seller/orders" },
    { name: "Analytics", path: "/dashboard/seller/analytics" },
    { name: "Settings", path: "/dashboard/settings" },
  ],
  admin: [
    { name: "Overview", path: "/dashboard/admin/overview" },
    { name: "Manage Users", path: "/dashboard/admin/users" },
    { name: "Manage Products", path: "/dashboard/admin/products" },
    { name: "Reported Items", path: "/dashboard/admin/reports" },
    { name: "Disputes", path: "/dashboard/admin/disputes" },
    { name: "Manage Orders", path: "/dashboard/admin/orders" },
    { name: "Payments", path: "/dashboard/admin/payments" },
    { name: "Analytics", path: "/dashboard/admin/analytics" },
    { name: "Settings", path: "/dashboard/settings" },
  ],
};

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

test("PHASE 2 & 3: Mobile Hamburger and Drawer Navigation Verification (Zero Runtime Errors)", async () => {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  try {
    const cookies = await getAuthCookies("buyer");
    const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
    await context.addCookies(cookies);

    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto(`${BASE_URL}/dashboard/buyer/overview`, { waitUntil: "load" });

    // 1. Verify hamburger is visible
    const hamburger = page.locator('button[aria-label="Open navigation menu"]');
    await hamburger.waitFor({ state: "visible" });
    assert.equal(await hamburger.isVisible(), true, "Hamburger button must be visible on mobile");

    // 2. Click hamburger to open drawer
    await hamburger.click();
    const drawerDialog = page.locator('[data-slot="drawer-dialog"]');
    await drawerDialog.waitFor({ state: "visible" });
    assert.equal(await drawerDialog.isVisible(), true, "Drawer dialog must open upon clicking hamburger");

    // Verify drawer contents
    const drawerHeading = page.locator('[data-slot="drawer-heading"]');
    assert.match(await drawerHeading.textContent(), /buyer\s+Portal/i, "Drawer heading must display role portal");

    const drawerLinks = page.locator('[data-slot="drawer-dialog"] a');
    const count = await drawerLinks.count();
    assert.ok(count >= 6, "Drawer must display role navigation links");

    // 3. Test Drawer close button
    const closeTrigger = page.locator('[data-slot="drawer-close-trigger"]');
    await closeTrigger.waitFor({ state: "visible" });
    await closeTrigger.click();
    await drawerDialog.waitFor({ state: "hidden" });
    assert.equal(await drawerDialog.isVisible(), false, "Drawer dialog must close when close button is clicked");

    // 4. Test reopen and navigation link click closes drawer
    await hamburger.click();
    await drawerDialog.waitFor({ state: "visible" });

    const wishlistLink = page.locator('[data-slot="drawer-dialog"] a:has-text("Wishlist")');
    await wishlistLink.click();
    await drawerDialog.waitFor({ state: "hidden" });
    await page.waitForURL("**/dashboard/buyer/wishlist");
    assert.equal(page.url().includes("/dashboard/buyer/wishlist"), true, "Must navigate to Wishlist route");

    // 5. Test repeatedly opening and closing drawer
    for (let i = 0; i < 3; i++) {
      await hamburger.click();
      await drawerDialog.waitFor({ state: "visible" });
      const currentClose = page.locator('[data-slot="drawer-close-trigger"]');
      await currentClose.click();
      await drawerDialog.waitFor({ state: "hidden" });
    }

    // 6. Test backdrop dismiss
    await hamburger.click();
    await drawerDialog.waitFor({ state: "visible" });
    await page.mouse.click(350, 400);
    await drawerDialog.waitFor({ state: "hidden" });

    assert.equal(errors.length, 0, `Expected 0 runtime errors, found: ${errors.join("; ")}`);
  } finally {
    await browser.close();
  }
});

test("PHASE 2: Desktop Layout, Stable Sidebar Positioning & Independent Scrolling", async () => {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  try {
    const cookies = await getAuthCookies("admin");
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.addCookies(cookies);

    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto(`${BASE_URL}/dashboard/admin/users`, { waitUntil: "load" });

    // 1. Desktop sidebar must be visible
    const sidebar = page.locator("#dashboard-sidebar");
    await sidebar.waitFor({ state: "visible" });
    assert.equal(await sidebar.isVisible(), true, "Sidebar must be visible on desktop");

    // 2. Hamburger menu must be hidden on desktop
    const hamburger = page.locator('button[aria-label="Open navigation menu"]');
    assert.equal(await hamburger.isVisible(), false, "Hamburger button must NOT be visible on desktop");

    // 3. Main content must exist and have independent scroll container
    const mainContent = page.locator("#dashboard-main-content");
    await mainContent.waitFor({ state: "visible" });
    assert.equal(await mainContent.count(), 1, "#dashboard-main-content container must exist");

    // Wait for client data to load so page has scrollable content
    await page.waitForFunction(
      () => {
        const el = document.querySelector("#dashboard-main-content");
        return el && el.scrollHeight > el.clientHeight;
      },
      { timeout: 10000 }
    );

    // Check initial bounding box of sidebar
    const initialSidebarBox = await sidebar.boundingBox();
    assert.ok(initialSidebarBox, "Sidebar must have bounding box");
    assert.equal(initialSidebarBox.x, 0, "Sidebar must be pinned to left: 0");
    assert.equal(initialSidebarBox.y, 0, "Sidebar must be pinned to top: 0");

    // 4. Scroll the main content
    await mainContent.evaluate((el) => {
      el.scrollTop = 500;
    });
    await page.waitForTimeout(300);

    const scrolledSidebarBox = await sidebar.boundingBox();
    assert.equal(scrolledSidebarBox.y, 0, "Sidebar must remain at top: 0 after main content is scrolled");
    assert.equal(scrolledSidebarBox.x, 0, "Sidebar must remain at left: 0 after main content is scrolled");

    // Check main scroll position
    const currentScrollTop = await mainContent.evaluate((el) => el.scrollTop);
    assert.ok(currentScrollTop > 0, "Main content must have scrolled independently");

    // 5. Scroll sidebar nav independently
    const sidebarNav = sidebar.locator(".overflow-y-auto");
    assert.equal(await sidebarNav.count(), 1, "Sidebar must have scrollable nav container");
    await sidebarNav.evaluate((el) => {
      el.scrollTop = 40;
    });
    await page.waitForTimeout(200);

    const mainScrollAfterNav = await mainContent.evaluate((el) => el.scrollTop);
    assert.equal(mainScrollAfterNav, currentScrollTop, "Sidebar nav scrolling must not move main content");

    // 6. Verify sign out button remains accessible in sidebar footer
    const signOutBtn = sidebar.locator('button:has-text("Sign Out")');
    assert.equal(await signOutBtn.isVisible(), true, "Sign Out button must remain visible and accessible");

    // 7. Verify no unexpected window horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    assert.equal(hasHorizontalOverflow, false, "Page must not have horizontal window overflow");

    assert.equal(errors.length, 0, `Expected 0 runtime errors, found: ${errors.join("; ")}`);
  } finally {
    await browser.close();
  }
});

test("PHASE 4: Verification across all 19 dashboard routes for Buyer, Seller, and Admin", async () => {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  try {
    for (const role of ["buyer", "seller", "admin"]) {
      const cookies = await getAuthCookies(role);
      const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      await context.addCookies(cookies);
      const page = await context.newPage();

      const pageErrors = [];
      page.on("pageerror", (err) => pageErrors.push(err.message));

      const routes = ROUTE_CONFIGS[role];
      for (const route of routes) {
        const res = await page.goto(`${BASE_URL}${route.path}`, { waitUntil: "load" });
        assert.ok(res.status() < 400, `Route ${route.path} returned HTTP ${res.status()}`);

        // Verify layout components are present
        const sidebar = page.locator("#dashboard-sidebar");
        await sidebar.first().waitFor({ state: "visible" });
        assert.equal(await sidebar.first().isVisible(), true, `Sidebar must be visible on ${route.path}`);

        const mainContent = page.locator("#dashboard-main-content").first();
        await mainContent.waitFor({ state: "visible" });
        assert.equal(await mainContent.isVisible(), true, `Main content must be visible on ${route.path}`);

        // Verify active navigation item
        const activeLink = sidebar.locator('a[aria-current="page"]');
        await activeLink.first().waitFor({ state: "visible" });
        const activeCount = await activeLink.count();
        assert.ok(activeCount >= 1, `Active nav item must be highlighted on ${route.path}`);

        // Check no page errors
        assert.equal(pageErrors.length, 0, `Errors on route ${route.path}: ${pageErrors.join("; ")}`);
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }
});

test("PHASE 5: Responsive Breakpoints Testing across all 9 Device Viewports", async () => {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  try {
    const cookies = await getAuthCookies("seller");

    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      await context.addCookies(cookies);
      const page = await context.newPage();
      const pageErrors = [];
      page.on("pageerror", (err) => pageErrors.push(err.message));

      await page.goto(`${BASE_URL}/dashboard/seller/overview`, { waitUntil: "load" });

      const sidebar = page.locator("#dashboard-sidebar");
      const hamburger = page.locator('button[aria-label="Open navigation menu"]');

      if (vp.isMobile) {
        // Sidebar should be hidden, hamburger should be visible
        assert.equal(await sidebar.count() === 0 || !(await sidebar.first().isVisible()), true, `Sidebar must be hidden on ${vp.name} (${vp.width}x${vp.height})`);
        await hamburger.waitFor({ state: "visible" });
        assert.equal(await hamburger.isVisible(), true, `Hamburger must be visible on ${vp.name} (${vp.width}x${vp.height})`);

        // Test opening mobile drawer
        await hamburger.click();
        const drawerDialog = page.locator('[data-slot="drawer-dialog"]');
        await drawerDialog.waitFor({ state: "visible" });
        assert.equal(await drawerDialog.isVisible(), true, `Drawer must open on ${vp.name}`);

        // Test closing drawer
        const closeBtn = page.locator('[data-slot="drawer-close-trigger"]');
        await closeBtn.click();
        await drawerDialog.waitFor({ state: "hidden" });
        assert.equal(await drawerDialog.isVisible(), false, `Drawer must close on ${vp.name}`);
      } else {
        // Desktop: Sidebar must be visible, hamburger must be hidden
        await sidebar.first().waitFor({ state: "visible" });
        assert.equal(await sidebar.first().isVisible(), true, `Sidebar must be visible on ${vp.name} (${vp.width}x${vp.height})`);
        assert.equal(await hamburger.isVisible(), false, `Hamburger must be hidden on ${vp.name} (${vp.width}x${vp.height})`);

        // Verify sidebar stays fixed at top: 0
        const box = await sidebar.first().boundingBox();
        assert.equal(box.y, 0, `Sidebar must be top: 0 on ${vp.name}`);
      }

      // Check no horizontal scrollbar on body
      const overflowX = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      assert.equal(overflowX, false, `Must not have horizontal overflow on ${vp.name}`);
      assert.equal(pageErrors.length, 0, `Errors on ${vp.name}: ${pageErrors.join("; ")}`);

      await context.close();
    }
  } finally {
    await browser.close();
  }
});
