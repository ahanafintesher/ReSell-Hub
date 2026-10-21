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
  const query = userEmail ? `?userEmail=${encodeURIComponent(userEmail)}` : "";
  const res = await serverFetch(`/api/payments${query}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch payment history");
  }

  return res.json();
};