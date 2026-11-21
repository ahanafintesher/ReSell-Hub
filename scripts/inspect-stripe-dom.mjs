import { chromium } from "playwright";
import Stripe from "stripe";
import fs from "fs";
import path from "path";

// Load .env
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

async function inspectStripeDOM() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "bdt",
          product_data: { name: "Audit Verification Item" },
          unit_amount: 50000,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: "http://localhost:3000/success/payment-success?session_id={CHECKOUT_SESSION_ID}",
    cancel_url: "http://localhost:3000/checkout?cancelled=true",
  });

  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto(session.url, { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForTimeout(4000);

  const inputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("input, button, iframe")).map(el => ({
      tag: el.tagName,
      id: el.id,
      name: el.name,
      type: el.type,
      placeholder: el.placeholder,
      src: el.src,
      text: el.innerText?.slice(0, 30)
    }));
  });

  console.log("Found DOM elements:", JSON.stringify(inputs, null, 2));
  await page.screenshot({ path: "test-evidence/stripe-checkout-loaded.png" });
  await browser.close();
}

inspectStripeDOM().catch(console.error);
