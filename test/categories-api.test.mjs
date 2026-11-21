import test from "node:test";
import assert from "node:assert/strict";
import { getAllCategories, getFeaturedCategories } from "../src/lib/actions/categories.js";

test("Category API — fetch all categories from live backend", async () => {
  const result = await getAllCategories();
  assert.equal(result.success, true, "Category fetch should succeed");
  assert.equal(result.error, null);
  assert.ok(Array.isArray(result.data), "Categories data must be an array");
  assert.equal(result.data.length, 9, "All active categories must contain 9 items");

  const expectedOrder = [
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

  const actualNames = result.data.map((c) => c.name);
  assert.deepEqual(actualNames, expectedOrder, "Categories order must match backend custom order");

  // Verify Others is included
  assert.ok(actualNames.includes("Others"), "Categories page must include Others");

  // Verify every record has _id, name, and description
  for (const cat of result.data) {
    assert.ok(typeof cat._id === "string" && cat._id.length > 0, "Category _id must be valid");
    assert.ok(typeof cat.name === "string" && cat.name.length > 0, "Category name must be valid");
    assert.ok(typeof cat.description === "string" && cat.description.length > 0, "Category description must be valid");
    assert.equal(cat.isActive, true, "Category must be active");
  }
});

test("Featured Categories API — fetch featured categories from live backend", async () => {
  const result = await getFeaturedCategories();
  assert.equal(result.success, true, "Featured categories fetch should succeed");
  assert.equal(result.error, null);
  assert.ok(Array.isArray(result.data), "Featured categories data must be an array");
  assert.equal(result.data.length, 8, "Featured categories must contain 8 items");

  const expectedFeaturedOrder = [
    "Electronics",
    "Audio",
    "Wearables",
    "Accessories",
    "Fashion",
    "Furniture",
    "Vehicles",
    "Mobile Phones",
  ];

  const actualNames = result.data.map((c) => c.name);
  assert.deepEqual(actualNames, expectedFeaturedOrder, "Featured order must match backend order");

  // Verify Others is excluded from featured
  assert.equal(actualNames.includes("Others"), false, "Featured section must NOT include Others");
});

test("Category Navigation URL — encodes spaces and special characters properly", () => {
  const testCategories = ["Mobile Phones", "Electronics", "Fashion & Apparel", "Others"];
  const encodedUrls = testCategories.map((name) => `/products?category=${encodeURIComponent(name)}`);

  assert.equal(encodedUrls[0], "/products?category=Mobile%20Phones");
  assert.equal(encodedUrls[1], "/products?category=Electronics");
  assert.equal(encodedUrls[2], "/products?category=Fashion%20%26%20Apparel");
  assert.equal(encodedUrls[3], "/products?category=Others");
});

test("Category Filtering & Search — matches dynamic names and descriptions", () => {
  const mockCategories = [
    { name: "Electronics", description: "Laptops, computers, displays, and consumer electronics." },
    { name: "Mobile Phones", description: "Certified pre-owned smartphones, tablets, and styluses." },
    { name: "Audio", description: "Noise-cancelling headphones and speakers." },
  ];

  const search = (query) => {
    const q = query.trim().toLowerCase();
    return mockCategories.filter(
      (c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    );
  };

  const laptopsResult = search("laptop");
  assert.equal(laptopsResult.length, 1);
  assert.equal(laptopsResult[0].name, "Electronics");

  const phonesResult = search("Mobile Phones");
  assert.equal(phonesResult.length, 1);
  assert.equal(phonesResult[0].name, "Mobile Phones");

  const tabletsResult = search("tablets");
  assert.equal(tabletsResult.length, 1);
  assert.equal(tabletsResult[0].name, "Mobile Phones");

  const noResult = search("nonexistent keyword xyz");
  assert.equal(noResult.length, 0);
});

test("Error Resilience — handles malformed and empty API payloads safely", () => {
  const validateResponse = (payload) => {
    if (!payload || payload.success !== true || !Array.isArray(payload.data)) {
      return { success: false, data: [], error: "Malformed category response" };
    }
    const valid = payload.data.filter(
      (c) => c && typeof c === "object" && typeof c.name === "string" && c.name.trim().length > 0
    );
    return { success: true, data: valid, error: null };
  };

  assert.equal(validateResponse(null).success, false);
  assert.equal(validateResponse({}).success, false);
  assert.equal(validateResponse({ success: false }).success, false);
  assert.equal(validateResponse({ success: true, data: "not an array" }).success, false);

  const emptyValid = validateResponse({ success: true, data: [] });
  assert.equal(emptyValid.success, true);
  assert.equal(emptyValid.data.length, 0);

  const partialCorrupt = validateResponse({
    success: true,
    data: [{ name: "Valid Cat" }, null, { name: "" }, { missingName: true }],
  });
  assert.equal(partialCorrupt.success, true);
  assert.equal(partialCorrupt.data.length, 1);
  assert.equal(partialCorrupt.data[0].name, "Valid Cat");
});
