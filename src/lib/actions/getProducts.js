'use server';

const baseUrl = process.env.NEXT_PUBLIC_RESELL_SERVER_URL || "http://localhost:5000";

export const getProducts = async ({ search = "", category = "all" } = {}) => {
  const params = new URLSearchParams();
  
  if (search && search.trim() !== "") {
    params.append("search", search);
  }
  
  if (category && category !== "all") {
    params.append("category", category);
  }

  const queryString = params.toString();
  const url = `${baseUrl}/api/products${queryString ? `?${queryString}` : ""}`;
  
  const res = await fetch(url, {
    cache: "no-store"
  });
  
  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }
  
  return res.json();
};