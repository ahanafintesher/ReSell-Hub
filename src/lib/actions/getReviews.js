"use server";

const getBaseUrl = () =>
  (
    process.env.RESELL_SERVER_URL ||
    process.env.NEXT_PUBLIC_RESELL_SERVER_URL ||
    "http://localhost:5000"
  ).replace(/\/$/, "");

export const getUserReviews = async (productId) => {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/reviews?productId=${productId}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    return [];
  }
  return res.json();
};