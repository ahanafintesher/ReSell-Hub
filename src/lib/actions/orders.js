"use server";

import { serverFetch } from "@/lib/api-client";

// post an order
export const postOrder = async (orderData) => {
  const res = await serverFetch("/api/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to create order");
  }

  return data;
};

// get orders by sellerInfo
export const getOrdersBySellerInfo = async (sellerInfo) => {
  const query = sellerInfo ? `?sellerInfo=${encodeURIComponent(sellerInfo)}` : "";
  const res = await serverFetch(`/api/seller/orders${query}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch seller orders");
  }

  return res.json();
};

// get orders by buyerInfo
export const getOrdersByBuyerInfo = async (buyerInfo) => {
  const query = buyerInfo ? `?buyerInfo=${encodeURIComponent(buyerInfo)}` : "";
  const res = await serverFetch(`/api/buyer/orders${query}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch buyer orders");
  }

  return res.json();
};

// delete/cancel an order
export const deleteOrder = async (orderId) => {
  const res = await serverFetch(`/api/orders/${orderId}`, {
    method: "DELETE",
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to delete order");
  }

  return data;
};

// update order status
export const updateOrderStatus = async (orderId, status) => {
  const res = await serverFetch(`/api/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to update order status");
  }

  return data;
};

// get all orders across platform for admin
export const getAdminOrders = async () => {
  try {
    const usersRes = await serverFetch("/api/admin/users", { cache: "no-store" });
    if (!usersRes.ok) {
      throw new Error("Failed to authenticate as admin or fetch users");
    }
    const users = await usersRes.json();
    const userList = Array.isArray(users) ? users : [];

    // Collect candidate seller & buyer emails from users collection
    const candidateEmails = new Set();
    userList.forEach((u) => {
      if (u.email) candidateEmails.add(u.email);
    });

    // Also collect sellerInfo from products
    try {
      const productsRes = await serverFetch("/api/products", { cache: "no-store" });
      if (productsRes.ok) {
        const products = await productsRes.json();
        if (Array.isArray(products)) {
          products.forEach((p) => {
            if (p.sellerInfo) candidateEmails.add(p.sellerInfo);
          });
        }
      }
    } catch {
      // Non-critical
    }

    // Query orders for each candidate seller
    const orderPromises = Array.from(candidateEmails).map(async (email) => {
      try {
        const res = await serverFetch(
          `/api/seller/orders?sellerInfo=${encodeURIComponent(email)}`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const data = await res.json();
          return Array.isArray(data) ? data : [];
        }
        return [];
      } catch {
        return [];
      }
    });

    const settledOrders = await Promise.all(orderPromises);
    const orderMap = new Map();

    settledOrders.flat().forEach((order) => {
      if (order && order._id) {
        orderMap.set(String(order._id), order);
      }
    });

    // Also query buyer orders to catch any orders where seller might be external or missing
    const buyerPromises = Array.from(candidateEmails).map(async (email) => {
      try {
        const res = await serverFetch(
          `/api/buyer/orders?buyerInfo=${encodeURIComponent(email)}`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const data = await res.json();
          return Array.isArray(data) ? data : [];
        }
        return [];
      } catch {
        return [];
      }
    });

    const settledBuyerOrders = await Promise.all(buyerPromises);
    settledBuyerOrders.flat().forEach((order) => {
      if (order && order._id) {
        orderMap.set(String(order._id), order);
      }
    });

    const allOrders = Array.from(orderMap.values()).sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );

    return allOrders;
  } catch (error) {
    console.error("getAdminOrders error:", error);
    throw new Error(error.message || "Failed to fetch admin orders");
  }
};


