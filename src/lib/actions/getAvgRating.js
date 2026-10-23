"use server";

const baseUrl =
  process.env.RESELL_SERVER_URL ||
  process.env.NEXT_PUBLIC_RESELL_SERVER_URL ||
  "http://localhost:5000";

export const getAvgRating = async (productId) => {
  if (!productId) return { averageRating: 0, avarageRating: 0 };
  try {
    const url = `${baseUrl.replace(/\/$/, "")}/api/reviews/average-rating?productId=${productId}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return { averageRating: 0, avarageRating: 0 };
    }
    const data = await res.json();
    const val = Number(data.averageRating ?? data.avarageRating ?? 0);
    return {
      averageRating: val,
      avarageRating: val,
    };
  } catch (err) {
    console.error("Failed to load average rating:", err);
    return { averageRating: 0, avarageRating: 0 };
  }
};