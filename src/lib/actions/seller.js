"use server";

import { serverFetch } from "@/lib/api-client";

/**
 * Get authentic seller analytics calculated by backend
 * Backend endpoint: GET /api/seller/analytics
 */
export const getSellerAnalytics = async (sellerEmail) => {
  const query = sellerEmail ? `?sellerInfo=${encodeURIComponent(sellerEmail)}` : "";
  const res = await serverFetch(`/api/seller/analytics${query}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch seller analytics");
  }

  return res.json();
};
