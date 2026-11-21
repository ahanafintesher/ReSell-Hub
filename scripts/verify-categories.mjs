import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const SCREENSHOT_DIR = path.resolve("test-evidence/screenshots/categories");
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: "320px", width: 320, height: 600 },
  { name: "375px", width: 375, height: 667 },
  { name: "390px", width: 390, height: 844 },
  { name: "768px", width: 768, height: 1024 },
  { name: "1024px", width: 1024, height: 768 },
  { name: "1280px", width: 1280, height: 800 },
  { name: "1440px", width: 1440, height: 900 },
];

async function runVerification() {
  console.log("=== STARTING CATEGORIES VERIFICATION ===");
  const results = {
    homepageFeatured: false,
    homepageOrder: false,
    homepageNoOthers: false,
    categoriesPageTotal: false,
    categoriesPageOrder: false,
    categoriesPageHasOthers: false,
    navbarLinks: false,
    searchFilter: false,
    responsiveViewports: [],
    consoleErrors: [],
  };

  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      results.consoleErrors.push(msg.text());
    }
  });

  try {
    // 1. Verify Homepage Featured Categories
    console.log("\n1. Testing Homepage Featured Categories...");
    await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

    const featuredSection = page.locator("section:has-text('Explore Popular Categories')");
    await featuredSection.waitFor({ timeout: 10000 });

    const featuredCards = featuredSection.locator("a[href^='/products?category=']");
    const featuredCount = await featuredCards.count();
    console.log(`Featured categories count: ${featuredCount}`);

    const featuredNames = [];
    const featuredHrefs = [];
    for (let i = 0; i < featuredCount; i++) {
      const card = featuredCards.nth(i);
      const name = (await card.locator("h3").textContent()).trim();
      const href = await card.getAttribute("href");
      featuredNames.push(name);
      featuredHrefs.push(href);
    }
    console.log("Featured categories rendered:", featuredNames);
    console.log("Featured card links:", featuredHrefs);

    const expectedFeatured = [
      "Electronics",
      "Audio",
      "Wearables",
      "Accessories",
      "Fashion",
      "Furniture",
      "Vehicles",
      "Mobile Phones",
    ];

    results.homepageFeatured = featuredCount === 8;
    results.homepageOrder = JSON.stringify(featuredNames) === JSON.stringify(expectedFeatured);
    results.homepageNoOthers = !featuredNames.includes("Others");

    console.log(`- Count is 8: ${results.homepageFeatured ? "PASS" : "FAIL"}`);
    console.log(`- Order matches exact backend order: ${results.homepageOrder ? "PASS" : "FAIL"}`);
    console.log(`- Others excluded: ${results.homepageNoOthers ? "PASS" : "FAIL"}`);

    // Verify "All Categories" link
    const allCategoriesLink = featuredSection.locator("a[href='/categories']");
    const hasAllCategoriesLink = (await allCategoriesLink.count()) > 0;
    console.log(`- 'All Categories' link -> /categories: ${hasAllCategoriesLink ? "PASS" : "FAIL"}`);

    // Screenshot homepage
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "homepage-featured.png") });

    // 2. Verify Navbar Categories Link
    console.log("\n2. Testing Navbar Navigation...");
    const desktopCatLink = page.locator("nav a[href='/categories']").first();
    results.navbarLinks = (await desktopCatLink.count()) > 0;
    console.log(`- Navbar Categories link exists: ${results.navbarLinks ? "PASS" : "FAIL"}`);

    // Click it to navigate
    await desktopCatLink.click();
    await page.waitForURL("**/categories", { timeout: 10000 });
    console.log(`- Navigated to: ${page.url()}`);

    // 3. Verify Categories Page
    console.log("\n3. Testing Categories Page (/categories)...");
    await page.waitForSelector("input[placeholder*='Search category']", { timeout: 10000 });

    const catCards = page.locator("a[href^='/products?category=']");
    const catCount = await catCards.count();
    console.log(`All categories count: ${catCount}`);

    const catNames = [];
    for (let i = 0; i < catCount; i++) {
      const card = catCards.nth(i);
      const name = (await card.locator("h2").textContent()).trim();
      catNames.push(name);
    }
    console.log("Categories rendered:", catNames);

    const expectedAll = [
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

    results.categoriesPageTotal = catCount === 9;
    results.categoriesPageOrder = JSON.stringify(catNames) === JSON.stringify(expectedAll);
    results.categoriesPageHasOthers = catNames.includes("Others");

    console.log(`- Count is 9: ${results.categoriesPageTotal ? "PASS" : "FAIL"}`);
    console.log(`- Order matches backend custom order: ${results.categoriesPageOrder ? "PASS" : "FAIL"}`);
    console.log(`- Others included: ${results.categoriesPageHasOthers ? "PASS" : "FAIL"}`);

    // Screenshot categories page
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "categories-page.png") });

    // 4. Test Search & Filter Functionality
    console.log("\n4. Testing Search & Filter Functionality...");
    const searchInput = page.locator("input[placeholder*='Search category']");
    await searchInput.fill("Mobile Phones");
    await page.waitForTimeout(300);

    const filteredAfterSearch = await page.locator("a[href^='/products?category=']").count();
    console.log(`- Cards visible after searching 'Mobile Phones': ${filteredAfterSearch} (expected: 1)`);

    // Clear search
    const clearButton = page.locator("button[aria-label='Clear search']");
    await clearButton.click();
    await page.waitForTimeout(300);

    const countAfterClear = await page.locator("a[href^='/products?category=']").count();
    console.log(`- Cards visible after clearing search: ${countAfterClear} (expected: 9)`);

    // Test filter group "Electronics & Tech"
    const techChip = page.locator("button:has-text('Electronics & Tech')");
    await techChip.click();
    await page.waitForTimeout(300);

    const countAfterTechFilter = await page.locator("a[href^='/products?category=']").count();
    console.log(`- Cards visible after 'Electronics & Tech' filter: ${countAfterTechFilter} (expected: 5)`);

    // Reset to "All Categories"
    const allChip = page.locator("button:has-text('All Categories')");
    await allChip.click();
    await page.waitForTimeout(300);

    const countAfterAllFilter = await page.locator("a[href^='/products?category=']").count();
    console.log(`- Cards visible after resetting to 'All Categories': ${countAfterAllFilter} (expected: 9)`);

    results.searchFilter =
      filteredAfterSearch === 1 &&
      countAfterClear === 9 &&
      countAfterTechFilter === 5 &&
      countAfterAllFilter === 9;

    console.log(`- Search & Filters work correctly: ${results.searchFilter ? "PASS" : "FAIL"}`);

    // 5. Test Responsive Viewports
    console.log("\n5. Testing 7 Responsive Viewports...");
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(200);

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      console.log(`- Viewport ${vp.name} (${vp.width}x${vp.height}): Overflow = ${hasHorizontalScroll ? "YES (FAIL)" : "NO (PASS)"}`);
      results.responsiveViewports.push({
        viewport: vp.name,
        width: vp.width,
        noOverflow: !hasHorizontalScroll,
      });

      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `categories-${vp.name}.png`),
      });
    }

    console.log("\n=== ALL PLAYWRIGHT VERIFICATION CHECKS COMPLETE ===");
    console.log(JSON.stringify(results, null, 2));

  } catch (err) {
    console.error("Verification failed:", err);
  } finally {
    await browser.close();
  }
}

runVerification();
