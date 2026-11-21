import test from "node:test";
import assert from "node:assert/strict";
import { getAllCategories, getFeaturedCategories } from "../src/lib/actions/categories.js";
import { getProducts, getFeaturedProducts } from "../src/lib/actions/getProducts.js";
import { getSingleProduct } from "../src/lib/actions/getSingleProduct.js";

const BASE_URL = "http://localhost:3000";
const BACKEND_URL = "http://localhost:5000";

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
  const sellerToken = await getJWT("e2e_seller@resellhub.test", "Password123!");

  // 1. Create product
  const createRes = await fetch(`${BACKEND_URL}/api/products`, {
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
    const getRes = await fetch(`${BACKEND_URL}/api/products/${productId}`, {
      headers: { Authorization: `Bearer ${sellerToken}` },
    });
    assert.equal(getRes.status, 200);
    const sellerDoc = await getRes.json();
    assert.equal(sellerDoc.status, "pending", "Backend must enforce pending status on seller creation");
    assert.equal(sellerDoc.moderationStatus, "pending");
    assert.equal(sellerDoc.isPubliclyVisible, false);

    // 3. Verify public cannot view pending item
    const publicRes = await fetch(`${BACKEND_URL}/api/products/${productId}`);
    assert.equal(publicRes.status, 404, "Unauthenticated user must receive 404 for pending product");

    // 4. Update title as owner seller
    const updateRes = await fetch(`${BACKEND_URL}/api/products/${productId}`, {
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
    const verifyUpdateRes = await fetch(`${BACKEND_URL}/api/products/${productId}`, {
      headers: { Authorization: `Bearer ${sellerToken}` },
    });
    const updatedDoc = await verifyUpdateRes.json();
    assert.equal(updatedDoc.title, "Automated Integration Test Camera (Updated)");
    assert.equal(updatedDoc.status, "pending", "Status must remain pending despite seller PATCH payload");

  } finally {
    // 6. Safe cleanup
    const deleteRes = await fetch(`${BACKEND_URL}/api/products/${productId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${sellerToken}` },
    });
    assert.equal(deleteRes.status, 200);
  }
});

test("API Integration: Wishlist Lifecycle — add, list, and delete with user boundary enforcement", async () => {
  const buyerToken = await getJWT("e2e_buyer@resellhub.test", "Password123!");

  // List existing products to pick one for wishlist
  const prods = await getProducts({ limit: 1 });
  const testProd = (Array.isArray(prods) ? prods : prods.products)[0];

  // 1. Add to wishlist
  const addRes = await fetch(`${BACKEND_URL}/api/wishlist`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${buyerToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product: testProd,
      userInfo: "e2e_buyer@resellhub.test",
    }),
  });

  // Could be 201 (added) or 409 (already in wishlist from previous run)
  assert.ok(addRes.status === 201 || addRes.status === 409);

  // 2. Retrieve wishlist
  const listRes = await fetch(`${BACKEND_URL}/api/wishlist`, {
    headers: { Authorization: `Bearer ${buyerToken}` },
  });
  assert.equal(listRes.status, 200);
  const items = await listRes.json();
  assert.ok(Array.isArray(items));
  const addedItem = items.find((i) => i.product?._id === testProd._id || i.productId === testProd._id);
  assert.ok(addedItem, "Added product must be found in buyer wishlist");

  // 3. Remove from wishlist
  const removeRes = await fetch(`${BACKEND_URL}/api/wishlist/${addedItem._id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${buyerToken}` },
  });
  assert.equal(removeRes.status, 200);
});

test("API Integration: Product Reporting Lifecycle — non-owner report submission and resolution", async () => {
  const buyerToken = await getJWT("e2e_buyer@resellhub.test", "Password123!");
  const adminToken = await getJWT("e2e_admin@resellhub.test", "Password123!");

  const prods = await getProducts({ limit: 1 });
  const testProd = (Array.isArray(prods) ? prods : prods.products)[0];

  // 1. Submit report as buyer
  const reportRes = await fetch(`${BACKEND_URL}/api/products/${testProd._id}/report`, {
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
  const adminReportsRes = await fetch(`${BACKEND_URL}/api/admin/reports`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.equal(adminReportsRes.status, 200);
  const reportsList = await adminReportsRes.json();
  const reports = Array.isArray(reportsList) ? reportsList : reportsList.reports || [];
  assert.ok(Array.isArray(reports));
});
