"use server";

import { serverFetch } from "@/lib/api-client";

export const getAdminUsers = async () => {
  const response = await serverFetch("/api/admin/users", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return response.json();
};

export const updateUserStatus = async (id, status) => {
  const response = await serverFetch(`/api/admin/users/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update user status");
  }

  return data;
};

export const deleteUser = async (id) => {
  const response = await serverFetch(`/api/admin/users/${id}`, {
    method: "DELETE",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to delete user");
  }

  return data;
};