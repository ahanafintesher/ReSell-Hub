'use server';

const getBaseUrl = () => {
  return (
    process.env.RESELL_SERVER_URL ||
    process.env.NEXT_PUBLIC_RESELL_SERVER_URL ||
    "http://localhost:5000"
  ).replace(/\/$/, "");
};

async function executeFetch(endpoint, options = {}) {
  try {
    const mod = await import("../api-client.js");
    if (mod && typeof mod.serverFetch === "function") {
      return await mod.serverFetch(endpoint, options);
    }
  } catch {
    // Fallback to direct fetch in standalone node/test environments
  }

  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  return fetch(url, options);
}

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
  const endpoint = `/api/products${queryString ? `?${queryString}` : ""}`;

  const res = await executeFetch(endpoint, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  return res.json();
};

export const getFeaturedProducts = async () => {
  try {
    const res = await executeFetch("/api/products/featured", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0 && (data[0].price !== undefined || data[0].title !== undefined)) {
        return data;
      }
      if (data && Array.isArray(data.products) && data.products.length > 0) {
        return data.products;
      }
    }
    // Fallback to available products query
    const fallback = await getProducts({ limit: 6, status: "available" });
    return Array.isArray(fallback) ? fallback : (fallback?.products || []);
  } catch (err) {
    console.warn("Failed to load featured products from /api/products/featured:", err.message);
    try {
      const fallback = await getProducts({ limit: 6, status: "available" });
      return Array.isArray(fallback) ? fallback : (fallback?.products || []);
    } catch {
      return [];
    }
  }
};