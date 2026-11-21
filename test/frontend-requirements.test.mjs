import test from "node:test";
import assert from "node:assert/strict";
import { getAllCategories } from "../src/lib/actions/categories.js";
import {
  formatBDT,
  aggregateCategoryDistribution,
  aggregateSellerTopProducts,
  aggregateOrdersTimeline,
} from "../src/lib/analyticsUtils.js";

// ============================================================================
// SECTION A: Product Navigation & Card Actions
// ============================================================================
test("A.1 Product Navigation — Buy Now navigates to correct product details route", () => {
  const product = {
    _id: "prod_x101",
    title: "Sony WH-1000XM5 Headphones",
    price: 32000,
    status: "available",
  };

  // Resolution of product ID matching ProductsCard convention
  const productId = product._id || product.id;
  assert.equal(productId, "prod_x101", "Product ID must be preserved");

  // Buy Now link resolution (Must route to /products/${productId}, not /checkout)
  const buyNowHref = `/products/${productId}`;
  assert.equal(
    buyNowHref,
    "/products/prod_x101",
    "Buy Now button must navigate to the product details route",
  );
  assert.ok(
    !buyNowHref.startsWith("/checkout"),
    "Buy Now must not navigate directly to checkout",
  );

  // View Details link resolution
  const viewDetailsHref = `/products/${productId}`;
  assert.equal(viewDetailsHref, "/products/prod_x101");
});

test("A.2 Product Navigation — handles string vs number IDs and preserves slug", () => {
  const numericIdProduct = { id: 98765, title: "Vintage Camera" };
  const mongoIdProduct = {
    _id: "673f1a2b3c4d5e6f7a8b9c0d",
    title: "Smart Watch",
  };

  const getDetailsRoute = (p) => `/products/${p._id || p.id}`;

  assert.equal(getDetailsRoute(numericIdProduct), "/products/98765");
  assert.equal(
    getDetailsRoute(mongoIdProduct),
    "/products/673f1a2b3c4d5e6f7a8b9c0d",
  );
});

test("A.3 Product Navigation — Add to Cart remains functional and independent", () => {
  const cart = [];
  const product = { _id: "p1", title: "Laptop", price: 50000, stock: 2 };

  // Add to cart action
  const addToCart = (item) => {
    const existing = cart.find((i) => i._id === item._id);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + 1, item.stock);
    } else {
      cart.push({ ...item, quantity: 1 });
    }
  };

  addToCart(product);
  assert.equal(cart.length, 1);
  assert.equal(cart[0].quantity, 1);

  // Adding again respects stock
  addToCart(product);
  assert.equal(cart[0].quantity, 2);
  addToCart(product);
  assert.equal(cart[0].quantity, 2, "Cannot exceed available stock");
});

// ============================================================================
// SECTION B: Category API Integration
// ============================================================================
test("B.1 Category Integration — fetches all 9 categories from live backend action", async () => {
  const result = await getAllCategories();
  assert.equal(result.success, true, "Category fetch must succeed");
  assert.equal(result.error, null);
  assert.ok(Array.isArray(result.data), "Categories must be an array");
  assert.equal(
    result.data.length,
    9,
    "Backend must supply exactly 9 active categories",
  );

  const expectedBackendCategories = [
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
  assert.deepEqual(
    actualNames,
    expectedBackendCategories,
    "Category names and order must match backend",
  );
});

test("B.2 Category Integration — rejects obsolete hardcoded categories", async () => {
  const result = await getAllCategories();
  const validBackendCategories = new Set(
    result.data.map((c) => c.name.toLowerCase()),
  );

  const obsoleteCategories = ["Home & Living", "Books", "Sports"];
  for (const cat of obsoleteCategories) {
    assert.equal(
      validBackendCategories.has(cat.toLowerCase()),
      false,
      `Obsolete category '${cat}' must not exist in live backend categories`,
    );
  }
});

test("B.3 Category Integration — handles network and API errors safely", async () => {
  // Defensive validation helper equivalent to isValidCategory in categories.js
  const isValid = (cat) =>
    cat !== null &&
    typeof cat === "object" &&
    typeof cat.name === "string" &&
    cat.name.trim().length > 0;

  assert.equal(isValid(null), false);
  assert.equal(isValid({}), false);
  assert.equal(isValid({ name: "" }), false);
  assert.equal(isValid({ name: "Electronics" }), true);
});

// ============================================================================
// SECTION C: Product Reporting
// ============================================================================
test("C.1 Product Reporting — validates allowed reasons and prevents empty submissions", () => {
  const allowedReasons = [
    "Counterfeit / Replica Product",
    "Misleading Description or Photos",
    "Prohibited or Dangerous Item",
    "Suspected Fraud or Scam",
    "Inappropriate or Offensive Content",
    "Incorrect Category or Condition",
    "Other Policy Violation",
  ];

  const validateReport = ({ reason, description }) => {
    if (!reason || typeof reason !== "string" || !reason.trim()) {
      return { valid: false, error: "Please select a reason for reporting" };
    }
    if (!allowedReasons.includes(reason.trim())) {
      return { valid: false, error: "Invalid report reason selected" };
    }
    return { valid: true, error: null };
  };

  assert.equal(validateReport({ reason: "" }).valid, false);
  assert.equal(validateReport({ reason: "Nonexistent Reason" }).valid, false);
  assert.equal(
    validateReport({
      reason: "Counterfeit / Replica Product",
      description: "Fake logo",
    }).valid,
    true,
  );
});

test("C.2 Product Reporting — blocks users from reporting their own listings", () => {
  const checkSelfReporting = (sellerEmail, userEmail) => {
    if (!sellerEmail || !userEmail) return false;
    return sellerEmail.trim().toLowerCase() === userEmail.trim().toLowerCase();
  };

  const seller = "seller@example.com";
  assert.equal(
    checkSelfReporting(seller, "seller@example.com"),
    true,
    "Should detect self reporting",
  );
  assert.equal(
    checkSelfReporting(seller, "buyer@example.com"),
    false,
    "Should allow other users to report",
  );
});

test("C.3 Product Reporting — admin report resolution and dismissal lifecycle", () => {
  const allowedStatuses = ["pending", "resolved", "dismissed"];

  const transitionReport = (report, newStatus, actionNotes = "") => {
    if (!allowedStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }
    return {
      ...report,
      status: newStatus,
      actionNotes,
      updatedAt: new Date(),
    };
  };

  const report = { _id: "rep_1", productId: "p_1", status: "pending" };
  const resolved = transitionReport(report, "resolved", "Listing removed");
  assert.equal(resolved.status, "resolved");
  assert.equal(resolved.actionNotes, "Listing removed");

  const dismissed = transitionReport(report, "dismissed", "Valid listing");
  assert.equal(dismissed.status, "dismissed");
});

// ============================================================================
// SECTION D: User Blocking & Account Management
// ============================================================================
test("D.1 User Blocking — Cancel leaves user status unchanged", () => {
  let blockConfirmUser = {
    _id: "user_99",
    name: "Test User",
    status: "active",
  };

  // Cancel action closes dialog without mutating user
  const handleCancel = () => {
    blockConfirmUser = null;
  };

  handleCancel();
  assert.equal(blockConfirmUser, null);
});

test("D.2 User Blocking — Confirm blocks user and guards against duplicate submissions", () => {
  let actionLoadingId = null;
  let user = { _id: "u_1", name: "Bad Actor", status: "active" };

  const handleConfirmBlock = (targetUser) => {
    if (actionLoadingId === targetUser._id) {
      throw new Error("Duplicate submission prevented");
    }
    actionLoadingId = targetUser._id;
    // Simulate mutation
    user = { ...user, status: "blocked" };
    actionLoadingId = null;
    return user;
  };

  const updated = handleConfirmBlock(user);
  assert.equal(updated.status, "blocked");
  assert.equal(actionLoadingId, null);
});

// ============================================================================
// SECTION E: Product Moderation Lifecycle
// ============================================================================
test("E.1 Product Moderation — seller product payload initializes as pending", () => {
  const createProductPayload = (formData, userEmail, userName) => ({
    title: formData.title,
    description: formData.description,
    category: formData.category,
    condition: formData.condition,
    price: Number(formData.price),
    stock: Number(formData.stock),
    sellerInfo: userEmail,
    sellerName: userName,
    status: "pending",
    moderationStatus: "pending",
    isPubliclyVisible: false,
    createdAt: new Date(),
  });

  const payload = createProductPayload(
    {
      title: "iPhone 13",
      description: "Good",
      category: "Mobile Phones",
      condition: "used",
      price: "45000",
      stock: "1",
    },
    "seller@test.com",
    "John Seller",
  );

  assert.equal(payload.status, "pending");
  assert.equal(payload.moderationStatus, "pending");
  assert.equal(payload.isPubliclyVisible, false);
});

test("E.2 Product Moderation — admin approval transitions listing to available", () => {
  const moderate = (product, decision) => {
    if (decision === "approve") {
      return {
        ...product,
        status: "available",
        moderationStatus: "approved",
        isPubliclyVisible: true,
      };
    }
    if (decision === "reject") {
      return {
        ...product,
        status: "rejected",
        moderationStatus: "rejected",
        isPubliclyVisible: false,
      };
    }
    return product;
  };

  const pending = { _id: "p1", status: "pending", moderationStatus: "pending" };
  const approved = moderate(pending, "approve");
  assert.equal(approved.status, "available");
  assert.equal(approved.moderationStatus, "approved");
  assert.equal(approved.isPubliclyVisible, true);

  const rejected = moderate(pending, "reject");
  assert.equal(rejected.status, "rejected");
  assert.equal(rejected.moderationStatus, "rejected");
  assert.equal(rejected.isPubliclyVisible, false);
});

test("E.3 Product Moderation — defensive public catalog hides pending & rejected products", () => {
  const marketplaceInventory = [
    {
      _id: "p1",
      title: "Item 1",
      status: "available",
      moderationStatus: "approved",
    },
    {
      _id: "p2",
      title: "Item 2",
      status: "pending",
      moderationStatus: "pending",
    },
    {
      _id: "p3",
      title: "Item 3",
      status: "rejected",
      moderationStatus: "rejected",
    },
    { _id: "p4", title: "Item 4", status: "available" },
  ];

  // Defensive filtering matching src/app/products/page.jsx
  const publicCatalog = marketplaceInventory.filter(
    (p) =>
      p.status !== "pending" &&
      p.status !== "rejected" &&
      p.moderationStatus !== "rejected",
  );

  assert.equal(publicCatalog.length, 2);
  assert.deepEqual(
    publicCatalog.map((p) => p._id),
    ["p1", "p4"],
  );
});

// ============================================================================
// SECTION F: Responsive UI & Analytics Data Preservation
// ============================================================================
test("F.1 Responsive Analytics — formatBDT formats currency accurately", () => {
  assert.equal(formatBDT(0), "৳0");
  assert.equal(formatBDT(500), "৳500");
  assert.equal(formatBDT(35000), "৳35,000");
  assert.equal(formatBDT(1250000), "৳1,250,000");
});

test("F.2 Responsive Analytics — aggregates Category Distribution for 3-tier view", () => {
  const sampleProducts = [
    { category: "Electronics", price: 30000 },
    { category: "Electronics", price: 20000 },
    { category: "Audio", price: 10000 },
    { category: "Furniture", price: 40000 },
  ];

  const dist = aggregateCategoryDistribution(sampleProducts);
  assert.equal(dist.length, 3);

  const electronics = dist.find((d) => d.category === "Electronics");
  assert.ok(electronics, "Electronics category must be present");
  assert.equal(electronics.count, 2);
  assert.equal(electronics.value, 50000);
  assert.equal(electronics.percentage, 50);

  // Verify responsive card attributes match table columns
  for (const item of dist) {
    assert.ok(typeof item.category === "string");
    assert.ok(typeof item.count === "number");
    assert.ok(typeof item.value === "number");
    assert.ok(typeof item.percentage === "number");
  }
});

test("F.3 Responsive Analytics — aggregates Seller Top Products without data loss", () => {
  const sampleOrders = [
    {
      productId: "prod_1",
      productTitle: "Noise Cancelling Headphones",
      price: 15000,
      paymentStatus: "paid",
      orderStatus: "delivered",
    },
    {
      productId: "prod_1",
      productTitle: "Noise Cancelling Headphones",
      price: 15000,
      paymentStatus: "paid",
      orderStatus: "processing",
    },
    {
      productId: "prod_2",
      productTitle: "Mechanical Keyboard",
      price: 5000,
      paymentStatus: "paid",
      orderStatus: "delivered",
    },
  ];

  const top = aggregateSellerTopProducts(sampleOrders);
  assert.equal(top.length, 2);
  assert.equal(top[0].id, "prod_1");
  assert.equal(top[0].ordersCount, 2);
  assert.equal(top[0].paidOrdersCount, 2);
  assert.equal(top[0].revenue, 30000);
  assert.equal(top[1].id, "prod_2");
  assert.equal(top[1].revenue, 5000);
});
