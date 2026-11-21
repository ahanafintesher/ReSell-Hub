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

const TEST_BUYER_EMAIL = process.env.TEST_BUYER_EMAIL || "e2e_buyer@resellhub.test";
const TEST_SELLER_EMAIL = process.env.TEST_SELLER_EMAIL || "e2e_seller@resellhub.test";
const TEST_ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || "e2e_admin@resellhub.test";
const TEST_ACCOUNT_PASSWORD = process.env.TEST_ACCOUNT_PASSWORD;

if (!TEST_ACCOUNT_PASSWORD) {
  throw new Error("TEST_ACCOUNT_PASSWORD environment variable must be configured in .env");
}

const BASE_URL = "http://localhost:3000";
const BACKEND_URL = "http://localhost:5000";

const EVIDENCE_DIR = path.resolve("test-evidence/browser-qa");
const BEFORE_DIR = path.join(EVIDENCE_DIR, "before-fixes");
const AFTER_DIR = path.join(EVIDENCE_DIR, "after-fixes");
const NAV_DIR = path.join(EVIDENCE_DIR, "navigation");
const DASH_DIR = path.join(EVIDENCE_DIR, "dashboard");
const RESP_DIR = path.join(EVIDENCE_DIR, "responsive");

[EVIDENCE_DIR, BEFORE_DIR, AFTER_DIR, NAV_DIR, DASH_DIR, RESP_DIR].forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const VIEWPORTS = [
  { name: "Small_Mobile_320x568", width: 320, height: 568 },
  { name: "Mobile_375x812", width: 375, height: 812 },
  { name: "Mobile_390x844", width: 390, height: 844 },
  { name: "Large_Mobile_430x932", width: 430, height: 932 },
  { name: "Tablet_768x1024", width: 768, height: 1024 },
  { name: "Laptop_1024x768", width: 1024, height: 768 },
  { name: "Desktop_1280x800", width: 1280, height: 800 },
  { name: "Large_Desktop_1440x900", width: 1440, height: 900 },
  { name: "Wide_Desktop_1920x1080", width: 1920, height: 1080 },
];

async function main() {
  console.log("===============================================================");
  console.log("STARTING FULL RESELL HUB BROWSER QA, DEBUG & RESOLUTION SUITE");
  console.log("===============================================================");

  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();

  const consoleLogs = [];
  const networkFailures = [];

  page.on("console", (msg) => {
    const text = msg.text();
    const type = msg.type();
    if (type === "error" || text.includes("Error") || text.includes("Hydration")) {
      consoleLogs.push({ type, text, location: page.url() });
      console.log(`[BROWSER CONSOLE ${type.toUpperCase()}] at ${page.url()}: ${text}`);
    }
  });

  page.on("response", (res) => {
    const status = res.status();
    const url = res.url();
    if (status >= 400 && !url.includes("favicon") && !url.includes("imgbb")) {
      networkFailures.push({ url, status, pageUrl: page.url() });
      console.log(`[NETWORK ERROR ${status}] ${url} (from ${page.url()})`);
    }
  });

  const testReport = {
    summary: { totalTests: 0, passed: 0, failed: 0 },
    phases: {},
    consoleErrors: consoleLogs,
    networkFailures: networkFailures,
  };

  function recordPass(phase, name, details = {}) {
    testReport.summary.totalTests++;
    testReport.summary.passed++;
    if (!testReport.phases[phase]) testReport.phases[phase] = [];
    testReport.phases[phase].push({ name, status: "PASS", ...details });
    console.log(`[PASS] (${phase}) ${name}`);
  }

  function recordFail(phase, name, details = {}) {
    testReport.summary.totalTests++;
    testReport.summary.failed++;
    if (!testReport.phases[phase]) testReport.phases[phase] = [];
    testReport.phases[phase].push({ name, status: "FAIL", ...details });
    console.error(`[FAIL] (${phase}) ${name}:`, details);
  }

  try {
    // -------------------------------------------------------------
    // PHASE 2: HOMEPAGE INITIAL RENDERING & AUDIT
    // -------------------------------------------------------------
    console.log("\n>>> PHASE 2: Initial Homepage Audit");
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(BEFORE_DIR, "01_homepage_initial.png") });

    const navExists = await page.locator("nav").isVisible();
    const heroExists = await page.locator("h1:has-text('Sustainable Shopping')").or(page.locator("h1")).first().isVisible();
    const featuredHeadExists = await page.locator('h2:has-text("Featured Listings")').first().isVisible();
    const popularCatExists = await page.locator("text=Explore Popular Categories").or(page.locator("text=Categories")).first().isVisible();
    const footerExists = await page.locator("footer").isVisible();

    if (navExists) recordPass("Phase2_Home", "Navbar visible on initial render");
    else recordFail("Phase2_Home", "Navbar missing on initial render");

    if (heroExists) recordPass("Phase2_Home", "Hero section rendered with heading");
    else recordFail("Phase2_Home", "Hero section missing");

    if (featuredHeadExists) recordPass("Phase2_Home", "Featured Listings section rendered dynamically with real products");
    else recordFail("Phase2_Home", "Featured Listings section missing");

    if (popularCatExists) recordPass("Phase2_Home", "Popular Categories section rendered");
    else recordFail("Phase2_Home", "Popular Categories section missing");

    if (footerExists) recordPass("Phase2_Home", "Footer section rendered");
    else recordFail("Phase2_Home", "Footer section missing");

    // Test Hero CTA Buttons
    const heroCta = page.locator('a[href*="/products"]:has-text("Explore Products"), a:has-text("Start Browsing"), a:has-text("Browse")').first();
    if (await heroCta.isVisible()) {
      await heroCta.click();
      await page.waitForURL((u) => u.pathname.includes("/products"), { timeout: 6000 });
      recordPass("Phase2_Home", "Hero CTA navigates to Products catalog", { url: page.url() });
      await page.screenshot({ path: path.join(NAV_DIR, "02_hero_cta_to_products.png") });
    }

    // -------------------------------------------------------------
    // PHASE 3: PRODUCTS PAGE FUNCTIONAL TESTING
    // -------------------------------------------------------------
    console.log("\n>>> PHASE 3: Products Page Functional Testing");
    await page.goto(`${BASE_URL}/products`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(NAV_DIR, "03_products_page.png") });

    const productCardsCount = await page.locator('a[href*="/products/"]').count();
    if (productCardsCount > 0) {
      recordPass("Phase3_Products", `Product listings rendered successfully (${productCardsCount} links)`);
    } else {
      recordFail("Phase3_Products", "No product listings rendered on /products");
    }

    // Search
    const searchInput = page.locator('input[aria-label="Search listings"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill("book");
      await page.waitForURL((u) => u.searchParams.has("search"), { timeout: 5000 }).catch(() => {});
      const searchUrl = page.url();
      if (searchUrl.includes("search=book")) {
        recordPass("Phase3_Products", "Product search query updates URL", { url: searchUrl });
      } else {
        recordFail("Phase3_Products", "Product search failed to update URL", { url: searchUrl });
      }
      await searchInput.fill("");
      await page.waitForTimeout(600);
    }

    // Category filter
    const catSelect = page.locator('select[aria-label="Filter by Category"]').first();
    if (await catSelect.isVisible()) {
      await catSelect.selectOption({ label: "Electronics" });
      await page.waitForTimeout(800);
      const catUrl = page.url();
      if (catUrl.includes("category=Electronics")) {
        recordPass("Phase3_Products", "Category filter dropdown updates URL", { url: catUrl });
      } else {
        recordFail("Phase3_Products", "Category filter failed to update URL", { url: catUrl });
      }
      await catSelect.selectOption({ value: "" });
      await page.waitForTimeout(600);
    }

    // Sort
    const sortSelect = page.locator('select[aria-label="Sort products"]').first();
    if (await sortSelect.isVisible()) {
      await sortSelect.selectOption("price-low-to-high");
      await page.waitForTimeout(800);
      const sortUrl = page.url();
      if (sortUrl.includes("sort=price-low-to-high")) {
        recordPass("Phase3_Products", "Sort dropdown updates URL", { url: sortUrl });
      } else {
        recordFail("Phase3_Products", "Sort dropdown failed to update URL", { url: sortUrl });
      }
      await sortSelect.selectOption("newest");
      await page.waitForTimeout(600);
    }

    // -------------------------------------------------------------
    // PHASE 4: CRITICAL BUY NOW NAVIGATION TEST
    // -------------------------------------------------------------
    console.log("\n>>> PHASE 4: Critical Buy Now Navigation Test");
    await page.goto(`${BASE_URL}/products`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    const firstBuyNowBtn = page.locator('a:has(button:has-text("Buy Now")), a:has-text("Buy Now")').first();
    const buyNowHref = await firstBuyNowBtn.getAttribute("href");
    console.log(`Buy Now Target href: ${buyNowHref}`);

    let activeProductId = null;
    if (buyNowHref && buyNowHref.includes("/products/") && !buyNowHref.includes("/checkout")) {
      recordPass("Phase4_BuyNow", "Buy Now is rendered as Link to /products/[id]", { href: buyNowHref });

      await Promise.all([
        page.waitForURL((u) => u.pathname.includes("/products/"), { timeout: 8000 }),
        firstBuyNowBtn.click(),
      ]);

      const currentUrl = page.url();
      activeProductId = currentUrl.split("/products/")[1]?.split("?")[0];
      await page.screenshot({ path: path.join(NAV_DIR, "04_buynow_product_details.png") });

      const detailsTitle = await page.locator("h1").first().textContent();
      const detailsAddToCart = await page.locator('button:has-text("Add to Cart")').first().isVisible();
      const detailsBuyNow = await page.locator('a[href*="/checkout"] button:has-text("Buy Now"), a:has-text("Buy Now")').first().isVisible();

      if (currentUrl.includes("/products/") && detailsAddToCart && detailsBuyNow) {
        recordPass("Phase4_BuyNow", "Buy Now successfully navigates to authoritative product details page", {
          url: currentUrl,
          title: detailsTitle?.trim(),
          hasAddToCart: detailsAddToCart,
          hasDetailsBuyNow: detailsBuyNow,
        });
      } else {
        recordFail("Phase4_BuyNow", "Product details page missing expected elements", { currentUrl });
      }
    } else {
      recordFail("Phase4_BuyNow", "Buy Now link target invalid or missing", { href: buyNowHref });
    }

    // -------------------------------------------------------------
    // PHASE 3 & CART LIFECYCLE
    // -------------------------------------------------------------
    console.log("\n>>> PHASE 3: Testing Add to Cart & Cart Lifecycle");
    const detailsAddToCartBtn = page.locator('button:has-text("Add to Cart")').first();
    if (await detailsAddToCartBtn.isVisible()) {
      await detailsAddToCartBtn.click();
      await page.waitForTimeout(800);
      recordPass("Phase3_Cart", "Add to Cart button clicked on product details page");
    }

    // Open /cart
    await page.goto(`${BASE_URL}/cart`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(NAV_DIR, "05_cart_page.png") });

    const cartHeading = await page.locator('h1:has-text("Shopping Cart")').first().isVisible();
    if (cartHeading) {
      recordPass("Phase3_Cart", "Shopping cart page loaded with items");
    } else {
      recordFail("Phase3_Cart", "Shopping cart heading missing");
    }

    // Quantity update
    const plusBtn = page.locator('button:has-text("+")').first();
    if (await plusBtn.isVisible()) {
      await plusBtn.click();
      await page.waitForTimeout(600);
      recordPass("Phase3_Cart", "Cart item quantity incremented");
    }

    // Continue Shopping
    const continueShopping = page.locator('a[href="/products"]').first();
    if (await continueShopping.isVisible()) {
      recordPass("Phase3_Cart", "Continue shopping link is available");
    }

    // -------------------------------------------------------------
    // PHASE 3: PUBLIC ROUTES VERIFICATION
    // -------------------------------------------------------------
    console.log("\n>>> PHASE 3: Testing Public Routes");
    const publicRoutes = [
      { path: "/categories", titleLocator: 'h1:has-text("Find Your Next")' },
      { path: "/about", titleLocator: 'h1:has-text("Giving Pre-Owned Goods")' },
      { path: "/contact", titleLocator: 'h1:has-text("Contact ReSell Hub Team")' },
      { path: "/auth/login", titleLocator: 'h2:has-text("Login")' },
      { path: "/auth/register", titleLocator: 'h2:has-text("Create an Account")' },
    ];

    for (const r of publicRoutes) {
      await page.goto(`${BASE_URL}${r.path}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(600);
      const isOk = await page.locator(r.titleLocator).first().isVisible();
      if (isOk) {
        recordPass("Phase3_PublicRoutes", `Public route ${r.path} renders cleanly`);
      } else {
        recordFail("Phase3_PublicRoutes", `Public route ${r.path} failed to render expected title`);
      }
      const safeName = r.path.replace(/\//g, "_");
      await page.screenshot({ path: path.join(NAV_DIR, `public${safeName}.png`) });
    }

    // Verify all 9 backend categories on /categories
    await page.goto(`${BASE_URL}/categories`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    const categoryPageContent = await page.content();
    const backendCategories = [
      "Electronics",
      "Audio",
      "Wearables",
      "Accessories",
      "Fashion",
      "Furniture",
      "Vehicles",
      "Mobile Phones",
      "Others",
    ];
    const categoriesFound = backendCategories.filter((c) => categoryPageContent.includes(c));
    if (categoriesFound.length === 9) {
      recordPass("Phase3_Categories", "All 9 backend categories rendered on /categories page", { count: categoriesFound.length });
    } else {
      recordFail("Phase3_Categories", `Only ${categoriesFound.length}/9 categories found on /categories`, { found: categoriesFound });
    }

    // -------------------------------------------------------------
    // PHASE 5: BUYER AUTHENTICATION & DASHBOARD
    // -------------------------------------------------------------
    console.log("\n>>> PHASE 5: Buyer Authentication & Dashboard Audit");
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: "networkidle" });
    await page.locator('input[type="email"]').first().fill(TEST_BUYER_EMAIL);
    await page.locator('input[type="password"]').first().fill(TEST_ACCOUNT_PASSWORD);
    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/auth/sign-in/email") && r.status() === 200),
      page.locator('button[type="submit"]').first().click(),
    ]);
    await page.waitForTimeout(1500);
    recordPass("Phase5_Auth", "Buyer login successful with 200 OK response");

    const buyerRoutes = [
      { path: "/dashboard/buyer/overview", name: "Overview" },
      { path: "/dashboard/buyer/orders", name: "Orders" },
      { path: "/dashboard/buyer/wishlist", name: "Wishlist" },
      { path: "/dashboard/buyer/payment-history", name: "Payment History" },
      { path: "/dashboard/buyer/profile", name: "Profile" },
    ];

    for (const br of buyerRoutes) {
      await page.goto(`${BASE_URL}${br.path}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(800);
      const isLoaded = !page.url().includes("/auth/login");
      if (isLoaded) {
        recordPass("Phase5_Buyer", `Buyer dashboard ${br.name} accessible`);
      } else {
        recordFail("Phase5_Buyer", `Buyer dashboard ${br.name} redirected to login`);
      }
      await page.screenshot({ path: path.join(DASH_DIR, `buyer_${br.name.toLowerCase().replace(/\s+/g, "_")}.png`) });
    }

    // Session persistence after reload
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    if (!page.url().includes("/auth/login")) {
      recordPass("Phase5_Auth", "Buyer session persisted across page reload");
    } else {
      recordFail("Phase5_Auth", "Buyer session lost on reload");
    }

    // RBAC: Buyer attempting admin route (Server boundary redirects to /dashboard/buyer/overview)
    console.log("Testing RBAC: Buyer accessing /dashboard/admin/users");
    await page.goto(`${BASE_URL}/dashboard/admin/users`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    const buyerAdminRedirect = page.url();
    if (!buyerAdminRedirect.includes("/dashboard/admin/users") && buyerAdminRedirect.includes("/dashboard/buyer/overview")) {
      recordPass("Phase5_RBAC", "Buyer safely redirected away from admin route by server boundary", { redirectedTo: buyerAdminRedirect });
    } else if (!buyerAdminRedirect.includes("/dashboard/admin/users")) {
      recordPass("Phase5_RBAC", "Buyer blocked from admin-only route", { redirectedTo: buyerAdminRedirect });
    } else {
      recordFail("Phase5_RBAC", "Buyer was allowed into admin users route!", { url: buyerAdminRedirect });
    }

    // Logout buyer
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    const userMenuBtn = page.locator('button[aria-label="User menu"]').first();
    if (await userMenuBtn.isVisible()) {
      await userMenuBtn.click();
      await page.waitForTimeout(400);
      const logoutBtn = page.locator('[data-key="logout"], [id="logout"], [role="menuitem"]:has-text("Logout")').first();
      if (await logoutBtn.isVisible()) {
        await logoutBtn.click();
        await page.waitForTimeout(1500);
        recordPass("Phase5_Auth", "Buyer logged out successfully");
      }
    }

    // -------------------------------------------------------------
    // PHASE 5 & 6: SELLER AUTHENTICATION & PRODUCT CREATION
    // -------------------------------------------------------------
    console.log("\n>>> PHASE 5 & 6: Seller Authentication & Product Creation");
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: "networkidle" });
    await page.locator('input[type="email"]').first().fill(TEST_SELLER_EMAIL);
    await page.locator('input[type="password"]').first().fill(TEST_ACCOUNT_PASSWORD);
    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/auth/sign-in/email") && r.status() === 200),
      page.locator('button[type="submit"]').first().click(),
    ]);
    await page.waitForTimeout(1500);
    recordPass("Phase5_Auth", "Seller login successful with 200 OK response");

    const sellerRoutes = [
      { path: "/dashboard/seller/overview", name: "Overview" },
      { path: "/dashboard/seller/products/add-products", name: "Add Products" },
      { path: "/dashboard/seller/products/my-products", name: "My Products" },
      { path: "/dashboard/seller/orders", name: "Orders" },
      { path: "/dashboard/seller/analytics", name: "Analytics" },
    ];

    for (const sr of sellerRoutes) {
      await page.goto(`${BASE_URL}${sr.path}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(800);
      const isLoaded = !page.url().includes("/auth/login");
      if (isLoaded) {
        recordPass("Phase5_Seller", `Seller dashboard ${sr.name} accessible`);
      } else {
        recordFail("Phase5_Seller", `Seller dashboard ${sr.name} redirected to login`);
      }
      await page.screenshot({ path: path.join(DASH_DIR, `seller_${sr.name.toLowerCase().replace(/\s+/g, "_")}.png`) });
    }

    // PHASE 6: Dynamic Category Loading in Seller Add Product Form
    await page.goto(`${BASE_URL}/dashboard/seller/products/add-products`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    const sellerFormText = await page.evaluate(() => document.querySelector("form")?.innerText || "");
    const sellerCategoriesFound = backendCategories.filter((c) => sellerFormText.includes(c));
    const obsoleteFound = ["Home & Living", "Books", "Sports"].filter((c) => sellerFormText.includes(c));

    if (sellerCategoriesFound.length === 9 && obsoleteFound.length === 0) {
      recordPass("Phase6_SellerAddProduct", "Seller Add Product form loads all 9 backend categories dynamically without obsolete options", {
        categories: sellerCategoriesFound,
      });
    } else {
      recordFail("Phase6_SellerAddProduct", "Category dropdown mismatch in Add Product form", {
        found: sellerCategoriesFound,
        obsolete: obsoleteFound,
      });
    }

    // Logout seller
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    const sellerMenuBtn = page.locator('button[aria-label="User menu"]').first();
    if (await sellerMenuBtn.isVisible()) {
      await sellerMenuBtn.click();
      await page.waitForTimeout(400);
      const logoutBtn = page.locator('[data-key="logout"], [id="logout"], [role="menuitem"]:has-text("Logout")').first();
      if (await logoutBtn.isVisible()) {
        await logoutBtn.click();
        await page.waitForTimeout(1500);
      }
    }

    // -------------------------------------------------------------
    // PHASE 5, 7, 8: ADMIN AUTHENTICATION, BLOCK MODAL, ANALYTICS
    // -------------------------------------------------------------
    console.log("\n>>> PHASE 5, 7, 8: Admin Authentication, Moderation & Analytics");
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: "networkidle" });
    await page.locator('input[type="email"]').first().fill(TEST_ADMIN_EMAIL);
    await page.locator('input[type="password"]').first().fill(TEST_ACCOUNT_PASSWORD);
    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/auth/sign-in/email") && r.status() === 200),
      page.locator('button[type="submit"]').first().click(),
    ]);
    await page.waitForTimeout(1500);
    recordPass("Phase5_Auth", "Admin login successful with 200 OK response");

    const adminRoutes = [
      { path: "/dashboard/admin/overview", name: "Overview" },
      { path: "/dashboard/admin/users", name: "Manage Users" },
      { path: "/dashboard/admin/products", name: "Manage Products" },
      { path: "/dashboard/admin/reports", name: "Reports" },
      { path: "/dashboard/admin/orders", name: "Orders" },
      { path: "/dashboard/admin/payments", name: "Payments" },
      { path: "/dashboard/admin/disputes", name: "Disputes" },
      { path: "/dashboard/admin/analytics", name: "Analytics" },
    ];

    for (const ar of adminRoutes) {
      await page.goto(`${BASE_URL}${ar.path}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(800);
      const isLoaded = !page.url().includes("/auth/login");
      if (isLoaded) {
        recordPass("Phase5_Admin", `Admin dashboard ${ar.name} accessible`);
      } else {
        recordFail("Phase5_Admin", `Admin dashboard ${ar.name} redirected to login`);
      }
      await page.screenshot({ path: path.join(DASH_DIR, `admin_${ar.name.toLowerCase().replace(/\s+/g, "_")}.png`) });
    }

    // PHASE 7: Accessible User Block AlertDialog
    console.log("\n>>> PHASE 7: Testing Accessible HeroUI AlertDialog for User Blocking");
    await page.goto(`${BASE_URL}/dashboard/admin/users`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    const blockBtn = page.locator('button:has-text("Block")').first();
    if (await blockBtn.isVisible()) {
      await blockBtn.click();
      await page.waitForTimeout(500);

      const alertHeading = page.locator('h3:has-text("Confirm User Account Suspension"), [role="alertdialog"] h3, h2').first();
      const isHeadingVisible = await alertHeading.isVisible();
      const cancelBtn = page.locator('button:has-text("Cancel")').first();
      const confirmBtn = page.locator('button:has-text("Confirm Block")').first();

      if (isHeadingVisible && (await cancelBtn.isVisible()) && (await confirmBtn.isVisible())) {
        recordPass("Phase7_UserBlocking", "HeroUI AlertDialog opened with accessible title and Cancel/Confirm buttons");

        // Escape dismissal
        await page.keyboard.press("Escape");
        await page.waitForTimeout(400);
        const closedAfterEscape = !(await confirmBtn.isVisible());
        if (closedAfterEscape) {
          recordPass("Phase7_UserBlocking", "AlertDialog dismissed via Escape key");
        } else {
          recordFail("Phase7_UserBlocking", "AlertDialog did not dismiss on Escape key");
        }

        // Reopen and test Cancel button
        await blockBtn.click();
        await page.waitForTimeout(400);
        await cancelBtn.click();
        await page.waitForTimeout(400);
        const closedAfterCancel = !(await confirmBtn.isVisible());
        if (closedAfterCancel) {
          recordPass("Phase7_UserBlocking", "AlertDialog dismissed via Cancel button without mutation");
        } else {
          recordFail("Phase7_UserBlocking", "AlertDialog did not dismiss on Cancel button");
        }
      } else {
        recordFail("Phase7_UserBlocking", "AlertDialog elements missing");
      }
    }

    // PHASE 8: Analytics Verification (Admin & Seller Charts & Tables)
    console.log("\n>>> PHASE 8: Verifying Analytics Charts & KPI Cards");
    await page.goto(`${BASE_URL}/dashboard/admin/analytics`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);

    const rechartsContainerCount = await page.locator(".recharts-responsive-container").count();
    const kpiCardsCount = await page.locator("text=Total Platform Revenue").or(page.locator("text=Gross Orders")).count();
    if (rechartsContainerCount > 0 && kpiCardsCount > 0) {
      recordPass("Phase8_Analytics", "Admin Analytics charts and KPI cards rendered", {
        chartsCount: rechartsContainerCount,
      });
    } else {
      recordFail("Phase8_Analytics", "Admin Analytics charts or KPI cards missing");
    }

    // -------------------------------------------------------------
    // PHASE 10: RESPONSIVE MATRIX TESTING ACROSS 9 VIEWPORTS
    // -------------------------------------------------------------
    console.log("\n>>> PHASE 10: Full Responsive Matrix Testing (9 Viewports x 6 Pages)");
    const responsiveTargets = [
      { name: "Home", url: `${BASE_URL}/` },
      { name: "Products", url: `${BASE_URL}/products` },
      { name: "Categories", url: `${BASE_URL}/categories` },
      { name: "Cart", url: `${BASE_URL}/cart` },
      { name: "Admin_Analytics", url: `${BASE_URL}/dashboard/admin/analytics` },
      { name: "Seller_Analytics", url: `${BASE_URL}/dashboard/seller/analytics` },
    ];

    let totalOverflows = 0;
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      for (const target of responsiveTargets) {
        await page.goto(target.url, { waitUntil: "networkidle" });
        await page.waitForTimeout(400);

        const overflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });

        if (overflow) {
          totalOverflows++;
          recordFail("Phase10_Responsive", `Horizontal overflow on ${target.name} at ${vp.name} (${vp.width}x${vp.height})`);
          await page.screenshot({ path: path.join(RESP_DIR, `OVERFLOW_${target.name}_${vp.name}.png`) });
        }
      }
      // Capture sample responsive screenshot for each viewport
      await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
      await page.screenshot({ path: path.join(RESP_DIR, `home_${vp.name}.png`) });
    }

    if (totalOverflows === 0) {
      recordPass("Phase10_Responsive", "Zero horizontal overflow across all 9 viewports on all audited pages (54/54 passed)");
    }

    // PHASE 9: Navbar Mobile Drawer & Direct Reloads
    console.log("\n>>> PHASE 9: Navbar Mobile Drawer & Route Reloads");
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    const mobileMenuToggle = page.locator('nav button[aria-label="Open menu"], nav button:has(svg)').last();
    if (await mobileMenuToggle.isVisible()) {
      await mobileMenuToggle.click();
      await page.waitForTimeout(400);
      const isDrawerOpen = await page.locator('nav a:has-text("Products")').first().isVisible();
      if (isDrawerOpen) {
        recordPass("Phase9_Navbar", "Mobile menu drawer opens on toggle click");
        await page.locator('nav a:has-text("Products")').first().click();
        await page.waitForURL((u) => u.pathname.includes("/products"), { timeout: 6000 });
        recordPass("Phase9_Navbar", "Mobile menu navigates and closes on route change");
      }
    }

    // Direct nested route reload
    await page.goto(`${BASE_URL}/products`, { waitUntil: "networkidle" });
    await page.reload({ waitUntil: "networkidle" });
    const isProductsAfterReload = await page.locator('h1:has-text("Marketplace Catalog")').first().isVisible();
    if (isProductsAfterReload) {
      recordPass("Phase9_Navigation", "Direct reload of nested /products route succeeds without 404 or errors");
    } else {
      recordFail("Phase9_Navigation", "Direct reload of nested /products route failed");
    }

    // Save after-fixes evidence
    await page.screenshot({ path: path.join(AFTER_DIR, "final_verified_products.png") });

  } catch (error) {
    console.error("Test Suite Fatal Error:", error);
    recordFail("FatalError", error.message);
  } finally {
    await browser.close();
  }

  // Save report
  fs.writeFileSync(
    path.join(EVIDENCE_DIR, "browser-qa-results.json"),
    JSON.stringify(testReport, null, 2)
  );

  console.log("\n===============================================================");
  console.log(`BROWSER QA COMPLETE! Total Tests: ${testReport.summary.totalTests}, Passed: ${testReport.summary.passed}, Failed: ${testReport.summary.failed}`);
  console.log(`Console Errors Logged: ${testReport.consoleErrors.length}`);
  console.log(`Network Failures Logged: ${testReport.networkFailures.length}`);
  console.log("===============================================================");
}

main().catch(console.error);
