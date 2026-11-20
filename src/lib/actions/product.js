"use server";

import { serverFetch } from "@/lib/api-client";

export const createProduct = async (productData) => {
  const res = await serverFetch("/api/products", {
    method: "POST",
    body: JSON.stringify(productData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to create product");
  }
  return data;
};

export const editProducts = async (id, productData) => {
  const res = await serverFetch(`/api/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(productData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to update product");
  }
  return data;
};

export const deleteProducts = async (id) => {
  const res = await serverFetch(`/api/products/${id}`, {
    method: "DELETE",
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Delete failed: ${res.status} - ${text}`);
  }

  return text ? JSON.parse(text) : { success: true };
};

/**
 * Moderate a product listing (Admin only)
 * Backend endpoint: PATCH /api/admin/products/:id/status
 * Supported statuses: "approved" | "rejected" | "pending" | "available" | "sold"
 */
export const moderateProduct = async (id, status) => {
  const res = await serverFetch(`/api/admin/products/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Failed to moderate product (${res.status})`);
  }

  return data;
};


