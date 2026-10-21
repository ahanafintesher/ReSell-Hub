"use server";

import { serverFetch } from "@/lib/api-client";

export const postReviews = async (review) => {
  const res = await serverFetch("/api/reviews", {
    method: "POST",
    body: JSON.stringify({ review }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to submit review");
  }

  return data;
};