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

async function testStripeSession() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  console.log("Stripe SDK initialized with key length:", process.env.STRIPE_SECRET_KEY?.length);

  // 1. Create a minimal test checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "bdt",
          product_data: { name: "Audit Verification Item" },
          unit_amount: 50000, // 500 BDT
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: "http://localhost:3000/success/payment-success?session_id={CHECKOUT_SESSION_ID}",
    cancel_url: "http://localhost:3000/checkout?cancelled=true",
  });

  console.log("Created test session:", session.id, "URL:", session.url);

  // 2. Test Playwright navigation to session.url
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
  });
  const page = await browser.newPage();
  console.log("Navigating to Stripe checkout URL in Playwright...");
  await page.goto(session.url, { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForTimeout(3000);
  console.log("Page loaded. Title:", await page.title(), "URL:", page.url());

  // Check if Stripe checkout form is rendered
  const pageContent = await page.content();
  const hasStripeHeader = pageContent.includes("Audit Verification Item") || pageContent.includes("Stripe");
  console.log("Stripe page rendered content successfully:", hasStripeHeader);

  await browser.close();
}

testStripeSession().catch(console.error);
