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

