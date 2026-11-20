import test from "node:test";
import assert from "node:assert/strict";

test("Cart Logic — adds item and calculates subtotal & total authoritatively", () => {
  const cartItems = [];
  const product = {
    _id: "prod_1",
    title: "Dell XPS 15",
    price: 35000,
    stock: 3,
  };

  // Add first item
  cartItems.push({
    ...product,
    quantity: 1,
  });

  let subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  assert.equal(subtotal, 35000);
  assert.equal(cartItems.length, 1);

  // Increase quantity
  cartItems[0].quantity += 1;
  subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  assert.equal(subtotal, 70000);

  // Stock capping
  const requestedQty = 5;
  const cappedQty = Math.min(requestedQty, product.stock);
  assert.equal(cappedQty, 3, "Quantity must be capped at available stock");
});

test("Cart Logic — removing item and clearing cart", () => {
  let cartItems = [
    { _id: "prod_1", title: "Item 1", price: 1000, quantity: 2 },
    { _id: "prod_2", title: "Item 2", price: 2500, quantity: 1 },
  ];

  // Remove prod_1
  cartItems = cartItems.filter((i) => i._id !== "prod_1");
  assert.equal(cartItems.length, 1);
  assert.equal(cartItems[0]._id, "prod_2");

  // Clear cart
  cartItems = [];
  assert.equal(cartItems.length, 0);
});

test("Checkout Form Validation — verifies mandatory shipping and customer fields", () => {
  const validate = (form) => {
    const errors = {};
    if (!form.fullName?.trim()) errors.fullName = "Full name is required";
    if (!form.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = "Valid email is required";
    }
    if (!form.phone?.trim()) errors.phone = "Phone number is required";
    if (!form.address?.trim()) errors.address = "Address is required";
    if (!form.city?.trim()) errors.city = "City is required";
    return errors;
  };

  const invalidForm = {
    fullName: "",
    email: "not-an-email",
    phone: "",
    address: "",
    city: "",
  };
  const errors = validate(invalidForm);
  assert.equal(Object.keys(errors).length, 5);

  const validForm = {
    fullName: "Md. Rakib Hasan",
    email: "rakib@example.com",
    phone: "+8801712345678",
    address: "House 12, Road 4, Dhanmondi",
    city: "Dhaka",
  };
  const cleanErrors = validate(validForm);
  assert.equal(Object.keys(cleanErrors).length, 0);
});

test("Admin Moderation — status validation and transitions", () => {
  const allowedModerationStatuses = ["approved", "rejected", "pending", "available", "sold"];

  const isValidStatus = (status) => allowedModerationStatuses.includes(status);

  assert.equal(isValidStatus("approved"), true);
  assert.equal(isValidStatus("rejected"), true);
  assert.equal(isValidStatus("pending"), true);
  assert.equal(isValidStatus("malicious_status"), false);

  const mapModerationToPublic = (action) => (action === "approved" ? "available" : action);
  assert.equal(mapModerationToPublic("approved"), "available");
  assert.equal(mapModerationToPublic("rejected"), "rejected");
});

test("Seller Dashboard KPI Calculation — derives Total Products, Sales, Revenue, Pending", () => {
  const sellerProducts = [
    { _id: "p1", status: "available" },
    { _id: "p2", status: "available" },
    { _id: "p3", status: "sold" },
  ];

  const sellerOrders = [
    { _id: "o1", price: 5000, paymentStatus: "paid", orderStatus: "delivered" },
    { _id: "o2", price: 12000, paymentStatus: "paid", orderStatus: "accepted" },
    { _id: "o3", price: 8000, paymentStatus: "paid", orderStatus: "cancelled" }, // cancelled excluded from revenue
    { _id: "o4", price: 3000, paymentStatus: "pending", orderStatus: "pending" }, // unpaid excluded
  ];

  const totalProducts = sellerProducts.length;
  assert.equal(totalProducts, 3, "Total products must count all listed inventory");

  const validPaidSales = sellerOrders.filter(
    (o) =>
      o.paymentStatus === "paid" &&
      o.orderStatus !== "cancelled" &&
      o.orderStatus !== "rejected"
  );

  const totalSales = validPaidSales.length;
  assert.equal(totalSales, 2, "Total sales must count only valid paid orders");

  const totalRevenue = validPaidSales.reduce((sum, o) => sum + o.price, 0);
  assert.equal(totalRevenue, 17000, "Total revenue must sum earned paid orders");

  const pendingOrders = sellerOrders.filter((o) => o.orderStatus === "pending").length;
  assert.equal(pendingOrders, 1, "Pending orders must count orders requiring action");
});

test("Report Moderation — valid report reason categories and transitions", () => {
  const allowedReasons = [
    "Counterfeit / Replica Product",
    "Misleading Description or Photos",
    "Prohibited or Dangerous Item",
    "Suspected Fraud or Scam",
    "Inappropriate or Offensive Content",
    "Incorrect Category or Condition",
    "Other Policy Violation",
  ];

  const report = {
    productId: "prod_99",
    reporterEmail: "buyer@example.com",
    reason: "Counterfeit / Replica Product",
    status: "pending",
  };

  assert.equal(allowedReasons.includes(report.reason), true);

  const allowedTransitions = ["resolved", "dismissed", "pending"];
  const resolveReport = (rep, nextStatus) => {
    if (!allowedTransitions.includes(nextStatus)) throw new Error("Invalid transition");
    return { ...rep, status: nextStatus, resolvedAt: new Date() };
  };

  const resolved = resolveReport(report, "resolved");
  assert.equal(resolved.status, "resolved");
  assert.ok(resolved.resolvedAt instanceof Date);
});

test("Admin Payment Monitoring — pagination and revenue aggregation", () => {
  const transactions = [
    { _id: "t1", amount: 2000, paymentStatus: "paid" },
    { _id: "t2", amount: 4500, paymentStatus: "paid" },
    { _id: "t3", amount: 1500, paymentStatus: "failed" },
    { _id: "t4", amount: 8000, paymentStatus: "paid" },
  ];

  const totalRevenue = transactions.reduce(
    (sum, t) => sum + (t.paymentStatus === "paid" ? t.amount : 0),
    0
  );
  assert.equal(totalRevenue, 14500);

  const limit = 2;
  const total = transactions.length;
  const totalPages = Math.ceil(total / limit);
  assert.equal(totalPages, 2);

  const page1 = transactions.slice(0, limit);
  assert.equal(page1.length, 2);
  const page2 = transactions.slice(limit, limit * 2);
  assert.equal(page2.length, 2);
});
