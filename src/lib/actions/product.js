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

