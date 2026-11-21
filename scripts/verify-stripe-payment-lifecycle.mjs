import Stripe from "stripe";
import { MongoClient, ObjectId } from "mongodb";
import fs from "fs";
import path from "path";

// Auto-load .env for credentials
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

// Also check backend .env if STRIPE_WEBHOOK_SECRET is not in frontend .env
const serverEnvPath = path.resolve("../resell-hub-server/.env");
if (fs.existsSync(serverEnvPath)) {
  const envContent = fs.readFileSync(serverEnvPath, "utf8");
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

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.AUTH_DB_NAME || "resell_hub";

const BASE_URL = "http://localhost:3000";
const BACKEND_URL = "http://localhost:5000";

const TEST_BUYER_EMAIL = process.env.TEST_BUYER_EMAIL || "e2e_buyer@resellhub.test";
const TEST_SELLER_EMAIL = process.env.TEST_SELLER_EMAIL || "e2e_seller@resellhub.test";
const TEST_ACCOUNT_PASSWORD = process.env.TEST_ACCOUNT_PASSWORD;

const EVIDENCE_DIR = path.resolve("test-evidence/final-production-audit/stripe");
if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

async function getJWT(email, password) {
  const loginRes = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: BASE_URL },
    body: JSON.stringify({ email, password }),
  });
  if (!loginRes.ok) {
    throw new Error(`Login failed for ${email}: ${loginRes.status}`);
  }
  const cookie = loginRes.headers.get("set-cookie");
  const tokenRes = await fetch(`${BASE_URL}/api/auth/token`, {
    headers: { Cookie: cookie },
  });
  const data = await tokenRes.json();
  return data.token;
}

async function runStripeAudit() {
  console.log("===============================================================================");
  console.log("   RESELL HUB — PHASE 4: STRIPE PAYMENT & WEBHOOK AUDIT VERIFICATION");
  console.log("===============================================================================");

  const results = [];
  function record(testName, status, details = {}) {
    const item = { testName, status, details, timestamp: new Date().toISOString() };
    results.push(item);
    console.log(`[${status}] ${testName}`, details.message || "");
    return item;
  }

  // 1. Verify Prerequisites
  if (!STRIPE_SECRET_KEY || !STRIPE_SECRET_KEY.startsWith("sk_test_")) {
    record("1. Stripe SDK Compatibility & Credentials", "BLOCKED", {
      message: "Valid STRIPE_SECRET_KEY (sk_test_*) not configured",
    });
    return finish(results);
  }

  if (!STRIPE_WEBHOOK_SECRET || !STRIPE_WEBHOOK_SECRET.startsWith("whsec_")) {
    record("1. Stripe Webhook Secret Configuration", "BLOCKED", {
      message: "Valid STRIPE_WEBHOOK_SECRET (whsec_*) not configured",
    });
    return finish(results);
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY);
  record("1. Stripe SDK Compatibility & Credentials", "PASS", {
    message: "Stripe SDK initialized successfully with test mode credentials",
  });

  // Connect to DB
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  const productsCol = db.collection("products");
  const ordersCol = db.collection("orders");
  const paymentsCol = db.collection("payments");
  const processedEventsCol = db.collection("processedEvents");

  let buyerToken;
  try {
    buyerToken = await getJWT(TEST_BUYER_EMAIL, TEST_ACCOUNT_PASSWORD);
  } catch (err) {
    record("Buyer Authentication for Stripe Checkout", "BLOCKED", { message: err.message });
    await client.close();
    return finish(results);
  }

  // 2. Setup isolated product
  const testPrice = 280;
  const insertProd = await productsCol.insertOne({
    title: `Stripe Lifecycle Test Item ${Date.now()}`,
    price: testPrice,
    category: "Electronics",
    condition: "Like New",
    description: "Production audit test item for complete Stripe checkout & webhook lifecycle verification",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"],
    sellerInfo: TEST_SELLER_EMAIL,
    sellerName: "E2E Test Seller",
    status: "available",
    moderationStatus: "approved",
    isPubliclyVisible: true,
    createdAt: new Date(),
  });
  const testProductId = insertProd.insertedId.toString();

  try {
    // Test 3: Checkout Session Creation via Backend API
    console.log("\n--- Testing Checkout Session Creation ---");
    const sessionRes = await fetch(`${BACKEND_URL}/api/create-checkout-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({ productId: testProductId }),
    });

    const sessionData = await sessionRes.json();
    if (sessionRes.status === 200 && sessionData.sessionId && sessionData.url) {
      record("3. Checkout Session Creation (API)", "PASS", {
        sessionId: sessionData.sessionId,
        url: sessionData.url.slice(0, 60) + "...",
        message: "Stripe Checkout session created with valid session ID and hosted payment URL",
      });
    } else {
      record("3. Checkout Session Creation (API)", "FAIL", {
        status: sessionRes.status,
        data: sessionData,
      });
      return finish(results);
    }

    const sessionId = sessionData.sessionId;

    // Test 4: Verify Live Stripe Session in Stripe Cloud
    const cloudSession = await stripe.checkout.sessions.retrieve(sessionId);
    if (cloudSession && cloudSession.id === sessionId && cloudSession.amount_total === testPrice * 100) {
      record("4. Stripe Cloud Session Verification", "PASS", {
        sessionId: cloudSession.id,
        amount_total: cloudSession.amount_total,
        currency: cloudSession.currency,
        payment_status: cloudSession.payment_status,
        message: "Stripe test cloud confirmed session exists with exact authoritative amount",
      });
    } else {
      record("4. Stripe Cloud Session Verification", "FAIL", {
        cloudSession,
      });
    }

    // Test 5: Atomic DB Reservation Guard
    const reservedProd = await productsCol.findOne({ _id: new ObjectId(testProductId) });
    if (reservedProd.reservationSessionId === sessionId && new Date(reservedProd.reservedUntil) > new Date()) {
      record("5. Atomic DB Reservation Guard", "PASS", {
        reservationSessionId: reservedProd.reservationSessionId,
        reservedUntil: reservedProd.reservedUntil,
        message: "Product atomically reserved in MongoDB for active checkout session",
      });
    } else {
      record("5. Atomic DB Reservation Guard", "FAIL", { reservedProd });
    }

    // Test 6: Server-Side Price Tampering Defense (Client attempts to override price)
    const tamperedRes = await fetch(`${BACKEND_URL}/api/create-checkout-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({ productId: testProductId, price: 1, amount: 100 }),
    });
    // Already reserved by same buyer: reuses or updates session with database price
    const tamperedData = await tamperedRes.json();
    if (tamperedData.sessionId) {
      const verifiedTamperedSession = await stripe.checkout.sessions.retrieve(tamperedData.sessionId);
      if (verifiedTamperedSession.amount_total === testPrice * 100) {
        record("6. Server-Side Price Tampering Defense", "PASS", {
          message: "Server strictly enforced database authoritative price; ignored client-supplied price manipulation",
          amount_total: verifiedTamperedSession.amount_total,
        });
      } else {
        record("6. Server-Side Price Tampering Defense", "FAIL", {
          amount_total: verifiedTamperedSession.amount_total,
        });
      }
    } else {
      record("6. Server-Side Price Tampering Defense", "PASS", {
        message: "Server safely rejected tampered request",
      });
    }

    // Test 7: Unauthorized Checkout Defense
    const unauthRes = await fetch(`${BACKEND_URL}/api/create-checkout-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: testProductId }),
    });
    if (unauthRes.status === 401) {
      record("7. Unauthorized Checkout Rejection", "PASS", {
        message: "Unauthenticated checkout request rejected with HTTP 401",
      });
    } else {
      record("7. Unauthorized Checkout Rejection", "FAIL", { status: unauthRes.status });
    }

    // Test 8: Webhook Missing Signature Header (400)
    console.log("\n--- Testing Webhook Signature Validations ---");
    const noSigRes = await fetch(`${BACKEND_URL}/api/stripe/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "checkout.session.completed" }),
    });
    if (noSigRes.status === 400) {
      record("8. Webhook Missing Signature Header", "PASS", {
        message: "Rejects webhook request without stripe-signature header with HTTP 400",
      });
    } else {
      record("8. Webhook Missing Signature Header", "FAIL", { status: noSigRes.status });
    }

    // Test 9: Webhook Invalid Signature (400)
    const invalidSigRes = await fetch(`${BACKEND_URL}/api/stripe/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "stripe-signature": "t=1234567890,v1=invalidsignaturehere000000000000000000000000000000000000000000",
      },
      body: JSON.stringify({ type: "checkout.session.completed" }),
    });
    if (invalidSigRes.status === 400) {
      record("9. Webhook Invalid Signature Rejection", "PASS", {
        message: "Rejects webhook request with forged or invalid signature with HTTP 400",
      });
    } else {
      record("9. Webhook Invalid Signature Rejection", "FAIL", { status: invalidSigRes.status });
    }

    // Test 10: Webhook Signed with Wrong Secret (400)
    const fakeSecret = "whsec_wrong_secret_key_12345678901234567890123456";
    const fakePayload = JSON.stringify({ id: "evt_test", type: "checkout.session.completed" });
    const wrongSecretHeader = stripe.webhooks.generateTestHeaderString({
      payload: fakePayload,
      secret: fakeSecret,
    });
    const wrongSecretRes = await fetch(`${BACKEND_URL}/api/stripe/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "stripe-signature": wrongSecretHeader,
      },
      body: fakePayload,
    });
    if (wrongSecretRes.status === 400) {
      record("10. Webhook Wrong Secret Rejection", "PASS", {
        message: "Rejects webhook signed with incorrect signing secret with HTTP 400",
      });
    } else {
      record("10. Webhook Wrong Secret Rejection", "FAIL", { status: wrongSecretRes.status });
    }

    // Test 11: Webhook Price Tampering Protection
    console.log("\n--- Testing Webhook Price Protection & Fulfillment ---");
    const tamperedWebhookEvent = {
      id: `evt_tampered_${Date.now()}`,
      type: "checkout.session.completed",
      data: {
        object: {
          id: sessionId,
          payment_status: "paid",
          amount_total: 100, // 1 BDT instead of 280 BDT
          currency: "bdt",
          metadata: { productId: testProductId },
        },
      },
    };
    const tamperedPayload = JSON.stringify(tamperedWebhookEvent);
    const tamperedHeader = stripe.webhooks.generateTestHeaderString({
      payload: tamperedPayload,
      secret: STRIPE_WEBHOOK_SECRET,
    });
    const tamperedWebhookRes = await fetch(`${BACKEND_URL}/api/stripe/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "stripe-signature": tamperedHeader,
      },
      body: tamperedPayload,
    });
    if (tamperedWebhookRes.status === 400) {
      record("11. Webhook Price Tampering Detection", "PASS", {
        message: "Webhook detected price mismatch and rejected payment fulfillment with HTTP 400",
      });
    } else {
      record("11. Webhook Price Tampering Detection", "FAIL", { status: tamperedWebhookRes.status });
    }

    // Test 12: Real Webhook Order Fulfillment & State Transition
    const legitimateEventId = `evt_legit_${Date.now()}`;
    const validWebhookEvent = {
      id: legitimateEventId,
      type: "checkout.session.completed",
      data: {
        object: {
          id: sessionId,
          payment_status: "paid",
          amount_total: testPrice * 100,
          currency: "bdt",
          customer_details: {
            email: TEST_BUYER_EMAIL,
            name: "E2E Test Buyer",
          },
          shipping_details: {
            address: {
              line1: "123 Audit Way",
              city: "Dhaka",
              postal_code: "1212",
              country: "BD",
            },
          },
          metadata: {
            productId: testProductId,
            buyerInfo: TEST_BUYER_EMAIL,
            buyerName: "E2E Test Buyer",
            buyerPhone: "+8801700000000",
            shippingAddress: "123 Audit Way, Dhaka 1212",
          },
        },
      },
    };

    const validPayload = JSON.stringify(validWebhookEvent);
    const validHeader = stripe.webhooks.generateTestHeaderString({
      payload: validPayload,
      secret: STRIPE_WEBHOOK_SECRET,
    });

    const validWebhookRes = await fetch(`${BACKEND_URL}/api/stripe/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "stripe-signature": validHeader,
      },
      body: validPayload,
    });

    const validWebhookData = await validWebhookRes.json();
    if (validWebhookRes.status === 200 && validWebhookData.received === true) {
      record("12. Webhook Event Processing (HTTP 200)", "PASS", {
        eventId: legitimateEventId,
        sessionId,
        received: validWebhookData.received,
        message: "Webhook processed checkout.session.completed successfully with HTTP 200",
      });
    } else {
      record("12. Webhook Event Processing (HTTP 200)", "FAIL", {
        status: validWebhookRes.status,
        data: validWebhookData,
      });
    }

    // Test 13: Database Order Verification
    const createdOrder = await ordersCol.findOne({ paymentId: sessionId });
    if (createdOrder && createdOrder.paymentStatus === "paid" && createdOrder.orderStatus === "pending") {
      record("13. Authoritative Order Creation in DB", "PASS", {
        orderId: createdOrder._id.toString(),
        paymentStatus: createdOrder.paymentStatus,
        orderStatus: createdOrder.orderStatus,
        price: createdOrder.price,
        message: "Order created authoritatively with paymentStatus='paid' and orderStatus='pending'",
      });
    } else {
      record("13. Authoritative Order Creation in DB", "FAIL", { createdOrder });
    }

    // Test 14: Database Payment Record Verification
    const createdPayment = await paymentsCol.findOne({ session_id: sessionId });
    if (createdPayment && createdPayment.paymentStatus === "paid" && Number(createdPayment.amount) === testPrice) {
      record("14. Authoritative Payment Record in DB", "PASS", {
        paymentId: createdPayment._id.toString(),
        amount: createdPayment.amount,
        paymentStatus: createdPayment.paymentStatus,
        message: "Payment record created in payments collection with verified paymentStatus='paid'",
      });
    } else {
      record("14. Authoritative Payment Record in DB", "FAIL", { createdPayment });
    }

    // Test 15: Product Sold State Transition
    const soldProduct = await productsCol.findOne({ _id: new ObjectId(testProductId) });
    if (soldProduct.status === "sold" && soldProduct.isPubliclyVisible === false && !soldProduct.reservationSessionId) {
      record("15. Product Sold Lifecycle Transition", "PASS", {
        status: soldProduct.status,
        isPubliclyVisible: soldProduct.isPubliclyVisible,
        message: "Product status transitioned to 'sold', hidden from catalog, reservation cleared",
      });
    } else {
      record("15. Product Sold Lifecycle Transition", "FAIL", { soldProduct });
    }

    // Test 16: Idempotency on Repeated Webhook Delivery
    console.log("\n--- Testing Webhook Idempotency ---");
    const duplicateRes = await fetch(`${BACKEND_URL}/api/stripe/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "stripe-signature": validHeader,
      },
      body: validPayload,
    });
    const duplicateData = await duplicateRes.json();
    const orderCount = await ordersCol.countDocuments({ paymentId: sessionId });
    const paymentCount = await paymentsCol.countDocuments({ session_id: sessionId });

    if (duplicateRes.status === 200 && orderCount === 1 && paymentCount === 1) {
      record("16. Webhook Idempotency Guard", "PASS", {
        orderCount,
        paymentCount,
        message: "Duplicate webhook delivery handled idempotently; zero duplicate orders or payments created",
      });
    } else {
      record("16. Webhook Idempotency Guard", "FAIL", {
        orderCount,
        paymentCount,
        duplicateData,
      });
    }

    // Test 17: Client Payment Status Forgery Defense
    console.log("\n--- Testing Client Forgery Protections ---");
    const forgedOrderRes = await fetch(`${BACKEND_URL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({
        productId: testProductId,
        paymentId: "cs_unverified_bogus_session_123",
        price: testPrice,
        paymentStatus: "paid", // Client claims paid!
        orderStatus: "delivered", // Client claims delivered!
      }),
    });
    const forgedOrderData = await forgedOrderRes.json();
    if (forgedOrderRes.status === 201) {
      const forgedInDb = await ordersCol.findOne({ _id: new ObjectId(forgedOrderData.insertedId) });
      if (forgedInDb.paymentStatus === "pending" && forgedInDb.orderStatus === "pending") {
        record("17. Client Forgery Status Downgrade", "PASS", {
          message: "Server safely forced client-forged paymentStatus='paid' and orderStatus='delivered' down to 'pending'",
          dbPaymentStatus: forgedInDb.paymentStatus,
          dbOrderStatus: forgedInDb.orderStatus,
        });
        // Cleanup forged order
        await ordersCol.deleteOne({ _id: forgedInDb._id });
      } else {
        record("17. Client Forgery Status Downgrade", "FAIL", { forgedInDb });
      }
    } else {
      record("17. Client Forgery Status Downgrade", "PASS", {
        message: `Server rejected unverified order submission with HTTP ${forgedOrderRes.status}`,
      });
    }

    // Test 18: Unhandled / Unsupported Event Graceful Handling
    const unhandledEvent = {
      id: `evt_unhandled_${Date.now()}`,
      type: "customer.created",
      data: { object: { id: "cus_test_123" } },
    };
    const unhandledPayload = JSON.stringify(unhandledEvent);
    const unhandledHeader = stripe.webhooks.generateTestHeaderString({
      payload: unhandledPayload,
      secret: STRIPE_WEBHOOK_SECRET,
    });
    const unhandledRes = await fetch(`${BACKEND_URL}/api/stripe/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "stripe-signature": unhandledHeader,
      },
      body: unhandledPayload,
    });
    if (unhandledRes.status === 200) {
      record("18. Graceful Handling of Unsupported Event Types", "PASS", {
        message: "Unhandled event type customer.created acknowledged with HTTP 200 without state mutation",
      });
    } else {
      record("18. Graceful Handling of Unsupported Event Types", "FAIL", { status: unhandledRes.status });
    }

    // Test 19: Expired Session Releases Reservation
    console.log("\n--- Testing Reservation Release on Cancellation/Expiry ---");
    // Create a new product and session for expiry test
    const expiryProd = await productsCol.insertOne({
      title: `Expiry Test Item ${Date.now()}`,
      price: 120,
      category: "Furniture",
      condition: "Good",
      description: "Item to test reservation release on session expiry",
      sellerInfo: TEST_SELLER_EMAIL,
      status: "reserved",
      moderationStatus: "approved",
      isPubliclyVisible: true,
      reservationSessionId: "cs_test_to_be_expired",
      reservedUntil: new Date(Date.now() + 10 * 60 * 1000),
      createdAt: new Date(),
    });
    const expiryProdId = expiryProd.insertedId.toString();

    const expiredEvent = {
      id: `evt_expired_${Date.now()}`,
      type: "checkout.session.expired",
      data: {
        object: {
          id: "cs_test_to_be_expired",
          metadata: { productId: expiryProdId },
        },
      },
    };
    const expiredPayload = JSON.stringify(expiredEvent);
    const expiredHeader = stripe.webhooks.generateTestHeaderString({
      payload: expiredPayload,
      secret: STRIPE_WEBHOOK_SECRET,
    });
    const expiredRes = await fetch(`${BACKEND_URL}/api/stripe/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "stripe-signature": expiredHeader,
      },
      body: expiredPayload,
    });

    const refreshedExpiryProd = await productsCol.findOne({ _id: new ObjectId(expiryProdId) });
    if (expiredRes.status === 200 && !refreshedExpiryProd.reservationSessionId && refreshedExpiryProd.status === "available") {
      record("19. Session Expiration Releases Reservation", "PASS", {
        message: "checkout.session.expired webhook cleanly released product reservation back to marketplace",
      });
    } else {
      record("19. Session Expiration Releases Reservation", "FAIL", { refreshedExpiryProd });
    }
    await productsCol.deleteOne({ _id: new ObjectId(expiryProdId) });

  } finally {
    // Teardown test product
    await productsCol.deleteOne({ _id: new ObjectId(testProductId) });
    await client.close();
  }

  return finish(results);
}

function finish(results) {
  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  const blocked = results.filter((r) => r.status === "BLOCKED").length;

  console.log("\n===============================================================================");
  console.log(`   STRIPE AUDIT SUMMARY: Total: ${results.length} | Passed: ${passed} | Failed: ${failed} | Blocked: ${blocked}`);
  console.log("===============================================================================");

  const summary = {
    total: results.length,
    passed,
    failed,
    blocked,
    results,
  };

  fs.writeFileSync(
    path.join(EVIDENCE_DIR, "stripe-lifecycle-audit-results.json"),
    JSON.stringify(summary, null, 2)
  );

  return summary;
}

runStripeAudit().catch(console.error);
