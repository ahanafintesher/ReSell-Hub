"use server";

import { serverFetch } from "@/lib/api-client";

/**
 * Submit a product report (authenticated)
 * Backend endpoint: POST /api/products/:id/report
 */
export const reportProduct = async (productId, reportData) => {
  const res = await serverFetch(`/api/products/${productId}/report`, {
    method: "POST",
    body: JSON.stringify({
      reason: reportData.reason,
      description: reportData.description || "",
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Failed to submit product report");
  }

  return data;
};

/**
 * Fetch reported products list for admin review
 * Backend endpoint: GET /api/admin/reports
 */
export const getAdminReports = async (params = {}) => {
  const searchParams = new URLSearchParams();
  if (params.status && params.status !== "all") {
    searchParams.append("status", params.status);
  }
  if (params.page) {
    searchParams.append("page", params.page);
  }
  if (params.limit) {
    searchParams.append("limit", params.limit);
  }

  const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const res = await serverFetch(`/api/admin/reports${query}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch product reports");
  }

  return res.json();
};

/**
 * Update report status (Admin only)
 * Backend endpoint: PATCH /api/admin/reports/:id
 */
export const updateReportStatus = async (reportId, updateData) => {
  const res = await serverFetch(`/api/admin/reports/${reportId}`, {
    method: "PATCH",
    body: JSON.stringify({
      status: updateData.status,
      actionNotes: updateData.actionNotes || "",
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Failed to update report status");
  }

  return data;
};
