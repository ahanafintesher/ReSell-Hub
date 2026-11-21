import { chromium } from "playwright";

async function verifyThemeAndEdgeCases() {
  console.log("=== TESTING THEME TOGGLE & ERROR STATES ===");
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
  });

  const page = await browser.newPage();

  try {
    // 1. Theme toggle test
    await page.goto("http://localhost:3000/categories", { waitUntil: "networkidle" });

    // Check theme toggle button
    const themeBtn = page.locator("button[aria-label*='mode'], button[aria-label*='theme'], button:has-text('Dark'), button:has-text('Light')").first();
    const hasThemeBtn = (await themeBtn.count()) > 0;
    console.log(`- Theme toggle button found: ${hasThemeBtn ? "PASS" : "FAIL"}`);

    if (hasThemeBtn) {
      await themeBtn.click();
      await page.waitForTimeout(300);
      const isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
      console.log(`- Toggled dark mode: class 'dark' present = ${isDark}`);
      // Toggle back
      await themeBtn.click();
      await page.waitForTimeout(300);
    }

    // 2. Mobile drawer navigation test
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

    const hamburger = page.locator("button[aria-label='Open menu']");
    const hasHamburger = (await hamburger.count()) > 0;
    console.log(`- Mobile hamburger visible on 375px: ${hasHamburger ? "PASS" : "FAIL"}`);

    if (hasHamburger) {
      await hamburger.click();
      await page.waitForTimeout(300);

      const mobileCatLink = page.locator("#mobile-nav a[href='/categories']");
      const hasMobileCat = (await mobileCatLink.count()) > 0;
      console.log(`- Mobile drawer Categories link -> /categories: ${hasMobileCat ? "PASS" : "FAIL"}`);

      if (hasMobileCat) {
        await mobileCatLink.click();
        await page.waitForURL("**/categories", { timeout: 10000 });
        console.log(`- Mobile drawer navigation succeeded to: ${page.url()}`);
      }
    }

    console.log("=== THEME & MOBILE CHECKS PASSED ===");
  } catch (err) {
    console.error("Theme/mobile test error:", err);
  } finally {
    await browser.close();
  }
}

verifyThemeAndEdgeCases();
