"use server";

import { serverFetch } from "@/lib/api-client";

export const getMyProducts = async (sellerInfo) => {
  const query = sellerInfo ? `?sellerInfo=${encodeURIComponent(sellerInfo)}` : "";
  const res = await serverFetch(`/api/my-products${query}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch seller products");
  }

  return res.json();
};




