"use server";

import { serverFetch } from "@/lib/api-client";

export const postPaymentHistory = async (metadata, session_id, date) => {
  const res = await serverFetch("/api/payments", {
    method: "POST",
    body: JSON.stringify({ metadata, session_id, date }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to record payment history");
  }

  return data;
};

export const getPaymentHistory = async (userEmail) => {
  try {
    const query = userEmail ? `?userEmail=${encodeURIComponent(userEmail)}` : "";
    const res = await serverFetch(`/api/payments${query}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return [];
    }

    return await res.json();
  } catch (err) {
    console.warn("getPaymentHistory notice:", err.message);
    return [];
  }
};

/**
 * Get global platform transactions for admin monitoring
 * Backend endpoint: GET /api/payments
 * Supports pagination, status filtering, and query search
 */
export const getAdminPayments = async (params = {}) => {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.append("page", params.page);
  if (params.limit) searchParams.append("limit", params.limit);
  if (params.search && params.search.trim()) searchParams.append("search", params.search.trim());
  if (params.status && params.status !== "all") searchParams.append("status", params.status);
  if (params.userEmail && params.userEmail.trim()) searchParams.append("userEmail", params.userEmail.trim());

  const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const res = await serverFetch(`/api/payments${query}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch admin transactions");
  }

  return res.json();
};
