/**
 * ReSell Hub Analytics Aggregation Utilities
 * JavaScript only - Pure calculation and formatting functions
 * Works strictly with real database fields: orderStatus, paymentStatus, price, createdAt, category, role
 */

export const formatBDT = (amount) => {
  const num = Number(amount);
  if (isNaN(num)) return "৳0";
  return `৳${num.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;
};

export const isValidDate = (val) => {
  if (!val) return false;
  const d = new Date(val);
  return !isNaN(d.getTime()) && d.getFullYear() > 2000;
};

export const formatDateLabel = (isoDateStr) => {
  if (!isValidDate(isoDateStr)) return "N/A";
  const d = new Date(isoDateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

/**
 * Aggregates orders chronologically by date bucket (YYYY-MM-DD).
 * Separates total orders from settled paid revenue.
 */
export const aggregateOrdersTimeline = (orders = []) => {
  if (!Array.isArray(orders) || orders.length === 0) return [];

  const dateMap = new Map();

  orders.forEach((order) => {
    if (!order) return;
    const rawDate = order.createdAt;
    if (!isValidDate(rawDate)) return;

    const d = new Date(rawDate);
    const dateKey = d.toISOString().split("T")[0]; // YYYY-MM-DD

    if (!dateMap.has(dateKey)) {
      dateMap.set(dateKey, {
        dateKey,
        timestamp: new Date(dateKey).getTime(),
        formattedDate: d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        fullDate: d.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        totalOrders: 0,
        paidOrders: 0,
        revenue: 0,
        deliveredOrders: 0,
        pendingOrders: 0,
      });
    }

    const bucket = dateMap.get(dateKey);
    bucket.totalOrders += 1;

    const status = (order.orderStatus || "pending").toLowerCase();
    const payment = (order.paymentStatus || "pending").toLowerCase();
    const price = Number(order.price) || 0;

    if (status === "delivered") {
      bucket.deliveredOrders += 1;
    } else if (status === "pending") {
      bucket.pendingOrders += 1;
    }

    // Revenue rule: only confirmed paid orders that are not rejected or cancelled
    if (payment === "paid" && status !== "rejected" && status !== "cancelled") {
      bucket.paidOrders += 1;
      bucket.revenue += price;
    }
  });

  return Array.from(dateMap.values()).sort(
    (a, b) => a.timestamp - b.timestamp
  );
};

/**
 * Aggregates order fulfillment lifecycle distribution
 */
export const aggregateOrderStatusDistribution = (orders = []) => {
  const statuses = [
    { key: "delivered", label: "Delivered", color: "#10b981" },
    { key: "shipped", label: "Shipped", color: "#8b5cf6" },
    { key: "processing", label: "Processing", color: "#6366f1" },
    { key: "accepted", label: "Accepted", color: "#3b82f6" },
    { key: "pending", label: "Pending", color: "#f59e0b" },
    { key: "rejected", label: "Rejected", color: "#ef4444" },
  ];

  const total = Array.isArray(orders) ? orders.length : 0;
  const counts = {};
  statuses.forEach((s) => (counts[s.key] = 0));

  if (Array.isArray(orders)) {
    orders.forEach((o) => {
      const st = (o?.orderStatus || "pending").toLowerCase();
      if (counts[st] !== undefined) {
        counts[st] += 1;
      } else {
        counts.pending += 1;
      }
    });
  }

  return statuses.map((s) => ({
    name: s.label,
    status: s.key,
    value: counts[s.key] || 0,
    color: s.color,
    percentage: total > 0 ? Math.round(((counts[s.key] || 0) / total) * 100) : 0,
  }));
};

/**
 * Aggregates products by marketplace category
 */
export const aggregateCategoryDistribution = (products = []) => {
  if (!Array.isArray(products) || products.length === 0) return [];

  const map = {};
  products.forEach((p) => {
    if (!p) return;
    const cat = (p.category || "Uncategorized").trim();
    if (!map[cat]) {
      map[cat] = {
        category: cat,
        count: 0,
        value: 0,
      };
    }
    map[cat].count += 1;
    map[cat].value += Number(p.price) || 0;
  });

  const totalProducts = products.length;

  return Object.values(map)
    .map((item) => ({
      ...item,
      percentage:
        totalProducts > 0 ? Math.round((item.count / totalProducts) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
};

/**
 * Aggregates users by platform role
 */
export const aggregateUserRoleDistribution = (users = []) => {
  if (!Array.isArray(users)) return [];

  const total = users.length;
  let buyers = 0;
  let sellers = 0;
  let admins = 0;
  let active = 0;
  let blocked = 0;

  users.forEach((u) => {
    if (!u) return;
    const role = (u.role || "buyer").toLowerCase();
    if (role === "admin") admins += 1;
    else if (role === "seller") sellers += 1;
    else buyers += 1;

    if (u.status === "blocked") blocked += 1;
    else active += 1;
  });

  const roles = [
    {
      name: "Buyers",
      role: "buyer",
      value: buyers,
      color: "#10b981",
      percentage: total > 0 ? Math.round((buyers / total) * 100) : 0,
    },
    {
      name: "Sellers",
      role: "seller",
      value: sellers,
      color: "#3b82f6",
      percentage: total > 0 ? Math.round((sellers / total) * 100) : 0,
    },
  ];

  if (admins > 0) {
    roles.push({
      name: "Admins",
      role: "admin",
      value: admins,
      color: "#8b5cf6",
      percentage: total > 0 ? Math.round((admins / total) * 100) : 0,
    });
  }

  return {
    roles,
    total,
    active,
    blocked,
    buyers,
    sellers,
    admins,
  };
};

/**
 * Aggregates top selling products for a seller
 */
export const aggregateSellerTopProducts = (orders = []) => {
  if (!Array.isArray(orders) || orders.length === 0) return [];

  const map = {};

  orders.forEach((o) => {
    if (!o) return;
    const key = o.productId || o.productTitle || "Unknown Product";
    const rawTitle = o.productTitle || "Product Item";
    const price = Number(o.price) || 0;
    const isPaid =
      o.paymentStatus === "paid" &&
      o.orderStatus !== "rejected" &&
      o.orderStatus !== "cancelled";

    if (!map[key]) {
      map[key] = {
        id: key,
        title: rawTitle,
        shortTitle:
          rawTitle.length > 22 ? `${rawTitle.slice(0, 20)}...` : rawTitle,
        ordersCount: 0,
        paidOrdersCount: 0,
        revenue: 0,
      };
    }

    map[key].ordersCount += 1;
    if (isPaid) {
      map[key].paidOrdersCount += 1;
      map[key].revenue += price;
    }
  });

  return Object.values(map).sort(
    (a, b) => b.revenue - a.revenue || b.ordersCount - a.ordersCount
  );
};

/**
 * Aggregates seller products into available vs sold listings
 */
export const aggregateSellerInventoryDistribution = (products = []) => {
  if (!Array.isArray(products) || products.length === 0) return [];
  const available = products.filter(
    (p) => (p?.status || "available") === "available"
  ).length;
  const sold = products.filter((p) => p?.status === "sold").length;
  const total = products.length;

  return [
    {
      name: "Available Listings",
      status: "available",
      value: available,
      color: "#10b981",
      percentage: total > 0 ? Math.round((available / total) * 100) : 0,
    },
    {
      name: "Sold Items",
      status: "sold",
      value: sold,
      color: "#3b82f6",
      percentage: total > 0 ? Math.round((sold / total) * 100) : 0,
    },
  ];
};
