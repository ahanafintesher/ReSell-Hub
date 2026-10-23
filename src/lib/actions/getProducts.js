'use server';

const baseUrl =
  process.env.RESELL_SERVER_URL ||
  process.env.NEXT_PUBLIC_RESELL_SERVER_URL ||
  "http://localhost:5000";

export const getProducts = async ({
  search = "",
  category = "all",
  condition = "all",
  status = "",
  minPrice = "",
  maxPrice = "",
  sort = "",
  page,
  limit,
} = {}) => {
  const params = new URLSearchParams();

  if (search && search.trim() !== "") {
    params.append("search", search.trim());
  }

  if (category && category !== "all") {
    params.append("category", category);
  }

  if (condition && condition !== "all") {
    params.append("condition", condition);
  }

  if (status && status !== "all") {
    params.append("status", status);
  }

  if (minPrice !== "" && minPrice !== undefined && !isNaN(Number(minPrice))) {
    params.append("minPrice", String(minPrice));
  }

  if (maxPrice !== "" && maxPrice !== undefined && !isNaN(Number(maxPrice))) {
    params.append("maxPrice", String(maxPrice));
  }

  if (sort && sort !== "") {
    params.append("sort", sort);
  }

  if (page) {
    params.append("page", String(page));
  }

  if (limit) {
    params.append("limit", String(limit));
  }

  const queryString = params.toString();
  const url = `${baseUrl.replace(/\/$/, "")}/api/products${
    queryString ? `?${queryString}` : ""
  }`;

  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  return res.json();
};

export const getFeaturedProducts = async () => {
  try {
    const url = `${baseUrl.replace(/\/$/, "")}/api/featured`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return await getProducts({ limit: 6, status: "available" });
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn("Failed to load featured products from /api/featured:", err.message);
    try {
      return await getProducts({ limit: 6, status: "available" });
    } catch {
      return [];
    }
  }
};