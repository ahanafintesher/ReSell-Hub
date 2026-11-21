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
    if (res.ok) {
      const data = await res.json();
      // If the response is an array of products (has price/title)
      if (Array.isArray(data) && data.length > 0 && (data[0].price !== undefined || data[0].title !== undefined)) {
        return data;
      }
      if (data && Array.isArray(data.products) && data.products.length > 0) {
        return data.products;
      }
    }
    // If /api/featured returned categories or non-product schema, fallback to available products query
    const fallback = await getProducts({ limit: 6, status: "available" });
    return Array.isArray(fallback) ? fallback : (fallback?.products || []);
  } catch (err) {
    console.warn("Failed to load featured products from /api/featured:", err.message);
    try {
      const fallback = await getProducts({ limit: 6, status: "available" });
      return Array.isArray(fallback) ? fallback : (fallback?.products || []);
    } catch {
      return [];
    }
  }
};