"use server";

import { serverFetch } from "@/lib/api-client";

export const postWishlist = async (product, userInfo) => {
  const res = await serverFetch("/api/wishlist", {
    method: "POST",
    body: JSON.stringify({ product, userInfo }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to add to wishlist");
  }

  return data;
};

export const getWishlist = async (userInfo) => {
  try {
    const query = userInfo ? `?userInfo=${encodeURIComponent(userInfo)}` : "";
    const res = await serverFetch(`/api/wishlist${query}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return [];
    }

    return await res.json();
  } catch (err) {
    console.warn("getWishlist notice:", err.message);
    return [];
  }
};

export const deleteWishlistItem = async (wishlistId) => {
  const res = await serverFetch(`/api/wishlist/${wishlistId}`, {
    method: "DELETE",
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to remove wishlist item");
  }

  return data;
};

