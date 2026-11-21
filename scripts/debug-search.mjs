import { chromium } from "playwright";

async function run() {
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto("http://localhost:3000/products", { waitUntil: "networkidle" });
  const input = page.locator('input[aria-label="Search listings"]');
  console.log("Input count:", await input.count());
  await input.fill("book");
  console.log("Value after fill:", await input.inputValue());
  await page.waitForTimeout(1000);
  console.log("URL after 1s:", page.url());
  await browser.close();
}
run().catch(console.error);
