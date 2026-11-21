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
  try {
    const query = buyerInfo ? `?buyerInfo=${encodeURIComponent(buyerInfo)}` : "";
    const res = await serverFetch(`/api/buyer/orders${query}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return [];
    }

    return await res.json();
  } catch (err) {
    console.warn("getOrdersByBuyerInfo notice:", err.message);
    return [];
  }
};

// cancel an order (dedicated soft cancellation route)
export const cancelOrder = async (orderId) => {
  const res = await serverFetch(`/api/orders/${orderId}/cancel`, {
    method: "PATCH",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Failed to cancel order (${res.status})`);
  }

  return data;
};

// delete an order (hard delete)
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

// get all platform orders for admin via direct indexed endpoint
export const getAdminOrders = async (params = {}) => {
  const queryParams = new URLSearchParams();

  if (params.search && typeof params.search === "string" && params.search.trim()) {
    queryParams.append("search", params.search.trim());
  }
  if (params.status && params.status !== "all") {
    queryParams.append("status", params.status);
  }
  if (params.paymentStatus && params.paymentStatus !== "all") {
    queryParams.append("paymentStatus", params.paymentStatus);
  }
  if (params.page) {
    queryParams.append("page", String(params.page));
  }
  if (params.limit) {
    queryParams.append("limit", String(params.limit));
  }

  const queryString = queryParams.toString();
  const url = `/api/admin/orders${queryString ? `?${queryString}` : ""}`;

  const res = await serverFetch(url, { cache: "no-store" });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to fetch admin orders (${res.status})`
    );
  }

  const data = await res.json();
  const ordersList = Array.isArray(data) ? data : (data?.orders || []);

  // Attach pagination metadata if available so consumers can access it
  if (data && typeof data === "object" && !Array.isArray(data)) {
    ordersList.total = typeof data.total === "number" ? data.total : ordersList.length;
    ordersList.page = typeof data.page === "number" ? data.page : 1;
    ordersList.limit = typeof data.limit === "number" ? data.limit : ordersList.length;
    ordersList.totalPages = typeof data.totalPages === "number" ? data.totalPages : 1;
    ordersList.orders = ordersList;
  }

  return ordersList;
};


