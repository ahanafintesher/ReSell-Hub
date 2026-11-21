"use server";

const getBaseUrl = () =>
  (
    process.env.RESELL_SERVER_URL ||
    process.env.NEXT_PUBLIC_RESELL_SERVER_URL ||
    "http://localhost:5000"
  ).replace(/\/$/, "");

export const getSingleProduct = async (id) => {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/products/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Failed to fetch product: HTTP ${res.status}`);
  }
  return res.json();
};
