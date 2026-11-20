"use server";

import { serverFetch } from "@/lib/api-client";

/**
 * Creates a dispute for an eligible order (Buyer / Admin).
 */
export async function createDispute(orderId, { reason, details }) {
  const response = await serverFetch(`/api/orders/${orderId}/dispute`, {
    method: "POST",
    body: JSON.stringify({ reason, details }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to submit dispute");
  }

  return data;
}

/**
 * Retrieves the dispute associated with an order.
 */
export async function getOrderDispute(orderId) {
  const response = await serverFetch(`/api/orders/${orderId}/dispute`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return await response.json();
}

/**
 * Fetches all platform disputes with filtering and pagination (Admin only).
 */
export async function getAdminDisputes(params = {}) {
  const { page = 1, limit = 10, status = "all", search = "" } = params;

  const query = new URLSearchParams();
  if (page) query.set("page", page.toString());
  if (limit) query.set("limit", limit.toString());
  if (status && status !== "all") query.set("status", status);
  if (search && search.trim()) query.set("search", search.trim());

  const response = await serverFetch(`/api/admin/disputes?${query.toString()}`, {
    cache: "no-store",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch disputes");
  }

  return data;
}

/**
 * Resolves or dismisses a dispute (Admin only).
 */
export async function resolveDispute(disputeId, payload = {}) {
  const resolution = payload.resolution || payload.decision;
  const resolutionNotes = payload.resolutionNotes || payload.decisionNotes || "";

  const response = await serverFetch(`/api/admin/disputes/${disputeId}/resolve`, {
    method: "PATCH",
    body: JSON.stringify({ resolution, resolutionNotes }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to resolve dispute");
  }

  return data;
}
