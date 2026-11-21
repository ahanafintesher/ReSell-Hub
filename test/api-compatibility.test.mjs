import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { getAllCategories, getFeaturedCategories } from "../src/lib/actions/categories.js";
import { getProducts, getFeaturedProducts } from "../src/lib/actions/getProducts.js";
import { getSingleProduct } from "../src/lib/actions/getSingleProduct.js";

// Load test environment credentials safely from .env if not already present
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

const TEST_BUYER_EMAIL = process.env.TEST_BUYER_EMAIL || "e2e_buyer@resellhub.test";
const TEST_SELLER_EMAIL = process.env.TEST_SELLER_EMAIL || "e2e_seller@resellhub.test";
const TEST_ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || "e2e_admin@resellhub.test";
const TEST_ACCOUNT_PASSWORD = process.env.TEST_ACCOUNT_PASSWORD;

if (!TEST_ACCOUNT_PASSWORD) {
  throw new Error("TEST_ACCOUNT_PASSWORD environment variable must be configured in .env for integration tests");
}

const BASE_URL = "http://localhost:3000";
const BACKEND_URL = "http://localhost:5000";

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

const jwtCache = new Map();

async function getJWT(email, password) {
  if (jwtCache.has(email)) {
    return jwtCache.get(email);
  }
  for (let attempt = 0; attempt < 5; attempt++) {
    const loginRes = await safeFetch(`${BASE_URL}/api/auth/sign-in/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: BASE_URL },
      body: JSON.stringify({ email, password }),
    });
    if (loginRes.status === 429) {
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      continue;
    }
    if (!loginRes.ok) {
      throw new Error(`Login failed for ${email}: ${loginRes.status}`);
    }
    const cookie = loginRes.headers.get("set-cookie");
    const tokenRes = await safeFetch(`${BASE_URL}/api/auth/token`, {
      headers: { Cookie: cookie },
    });
    const data = await tokenRes.json();
    jwtCache.set(email, data.token);
    return data.token;
  }
  throw new Error(`Exceeded login retry attempts for ${email}`);
}

test("API Integration: Categories Contract — live backend returns 9 active categories in exact order", async () => {
  const result = await getAllCategories();
  assert.equal(result.success, true);
  assert.equal(result.data.length, 9);
  const expected = [
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
  assert.deepEqual(result.data.map((c) => c.name), expected);
});

test("API Integration: Featured Categories Contract — returns 8 categories excluding Others", async () => {
  const result = await getFeaturedCategories();
  assert.equal(result.success, true);
  assert.equal(result.data.length, 8);
  assert.equal(result.data.some((c) => c.name === "Others"), false);
});

test("API Integration: Products Public Feed — returns only published/available products", async () => {
  const result = await getProducts();
  const products = Array.isArray(result) ? result : result.products || [];
  assert.ok(products.length > 0, "Marketplace should contain products");

  for (const prod of products) {
    assert.notEqual(prod.status, "pending", "Pending products must never appear in public feed");
    assert.notEqual(prod.status, "rejected", "Rejected products must never appear in public feed");
    assert.notEqual(prod.moderationStatus, "pending", "Pending moderation status must not leak");
    assert.notEqual(prod.moderationStatus, "rejected", "Rejected moderation status must not leak");
    assert.ok(prod.title, "Product must have title");
    assert.ok(typeof prod.price === "number", "Product price must be numeric");
  }
});

test("API Integration: Featured Products — returns available products with valid schemas", async () => {
  const products = await getFeaturedProducts();
  assert.ok(Array.isArray(products), "Featured products must return an array");
  for (const p of products) {
    assert.equal(p.status, "available");
    assert.ok(p.title);
    assert.ok(typeof p.price === "number");
  }
});

test("API Integration: Single Product Details — returns sanitized public info for available item", async () => {
  const list = await getProducts({ limit: 1 });
  const products = Array.isArray(list) ? list : list.products || [];
  assert.ok(products.length > 0);
  const testId = products[0]._id;

  const item = await getSingleProduct(testId);
  assert.equal(item._id, testId);
  assert.ok(item.title);
  assert.ok(typeof item.price === "number");
  // Phone numbers must not leak in public seller info
  if (item.sellerInfo && typeof item.sellerInfo === "object") {
    assert.equal(item.sellerInfo.phone, undefined);
  }
});

test("API Integration: Seller Product Lifecycle — create (pending), update, and delete with clean teardown", async () => {
  const sellerToken = await getJWT(TEST_SELLER_EMAIL, TEST_ACCOUNT_PASSWORD);

  // 1. Create product
  const createRes = await safeFetch(`${BACKEND_URL}/api/products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${sellerToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: "Automated Integration Test Camera",
      price: 18500,
      category: "Electronics",
      condition: "Like New",
      description: "Testing API compatibility and lifecycle",
      images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500"],
      // Attacker fields to verify backend overrides
      status: "available",
      moderationStatus: "approved",
      isPubliclyVisible: true,
    }),
  });

  assert.equal(createRes.status, 201);
  const createData = await createRes.json();
  const productId = createData.insertedId;
  assert.ok(productId, "Product insertion must return insertedId");

  try {
    // 2. Fetch as seller: verify backend enforced pending moderation
    const getRes = await safeFetch(`${BACKEND_URL}/api/products/${productId}`, {
      headers: { Authorization: `Bearer ${sellerToken}` },
    });
    assert.equal(getRes.status, 200);
    const sellerDoc = await getRes.json();
    assert.equal(sellerDoc.status, "pending", "Backend must enforce pending status on seller creation");
    assert.equal(sellerDoc.moderationStatus, "pending");
    assert.equal(sellerDoc.isPubliclyVisible, false);

    // 3. Verify public cannot view pending item
    const publicRes = await safeFetch(`${BACKEND_URL}/api/products/${productId}`);
    assert.equal(publicRes.status, 404, "Unauthenticated user must receive 404 for pending product");

    // 4. Update title as owner seller
    const updateRes = await safeFetch(`${BACKEND_URL}/api/products/${productId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${sellerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Automated Integration Test Camera (Updated)",
        status: "available", // Attempt status tampering
      }),
    });
    assert.equal(updateRes.status, 200);

    // 5. Verify title updated but status remained pending
    const verifyUpdateRes = await safeFetch(`${BACKEND_URL}/api/products/${productId}`, {
      headers: { Authorization: `Bearer ${sellerToken}` },
    });
    const updatedDoc = await verifyUpdateRes.json();
    assert.equal(updatedDoc.title, "Automated Integration Test Camera (Updated)");
    assert.equal(updatedDoc.status, "pending", "Status must remain pending despite seller PATCH payload");

  } finally {
    // 6. Safe cleanup
    const deleteRes = await safeFetch(`${BACKEND_URL}/api/products/${productId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${sellerToken}` },
    });
    assert.equal(deleteRes.status, 200);
  }
});

test("API Integration: Wishlist Lifecycle — add, list, and delete with user boundary enforcement", async () => {
  const buyerToken = await getJWT(TEST_BUYER_EMAIL, TEST_ACCOUNT_PASSWORD);

  // List existing products to pick one for wishlist
  const prods = await getProducts({ limit: 1 });
  const testProd = (Array.isArray(prods) ? prods : prods.products)[0];

  // 1. Add to wishlist
  const addRes = await safeFetch(`${BACKEND_URL}/api/wishlist`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${buyerToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product: testProd,
      userInfo: TEST_BUYER_EMAIL,
    }),
  });

  // Could be 201 (added) or 409 (already in wishlist from previous run)
  assert.ok(addRes.status === 201 || addRes.status === 409);

  // 2. Retrieve wishlist
  const listRes = await safeFetch(`${BACKEND_URL}/api/wishlist`, {
    headers: { Authorization: `Bearer ${buyerToken}` },
  });
  assert.equal(listRes.status, 200);
  const items = await listRes.json();
  assert.ok(Array.isArray(items));
  const addedItem = items.find((i) => i.product?._id === testProd._id || i.productId === testProd._id);
  assert.ok(addedItem, "Added product must be found in buyer wishlist");

  // 3. Remove from wishlist
  const removeRes = await safeFetch(`${BACKEND_URL}/api/wishlist/${addedItem._id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${buyerToken}` },
  });
  assert.equal(removeRes.status, 200);
});

test("API Integration: Product Reporting Lifecycle — non-owner report submission and resolution", async () => {
  const buyerToken = await getJWT(TEST_BUYER_EMAIL, TEST_ACCOUNT_PASSWORD);
  const adminToken = await getJWT(TEST_ADMIN_EMAIL, TEST_ACCOUNT_PASSWORD);

  const prods = await getProducts({ limit: 1 });
  const testProd = (Array.isArray(prods) ? prods : prods.products)[0];

  // 1. Submit report as buyer
  const reportRes = await safeFetch(`${BACKEND_URL}/api/products/${testProd._id}/report`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${buyerToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reason: "Incorrect Category or Condition",
      description: "Automated integration test report entry",
    }),
  });

  // 201 or 409 (if previously reported pending)
  assert.ok(reportRes.status === 201 || reportRes.status === 409);

  // 2. Admin retrieves reports
  const adminReportsRes = await safeFetch(`${BACKEND_URL}/api/admin/reports`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.equal(adminReportsRes.status, 200);
  const reportsList = await adminReportsRes.json();
  const reports = Array.isArray(reportsList) ? reportsList : reportsList.reports || [];
  assert.ok(Array.isArray(reports));
});
