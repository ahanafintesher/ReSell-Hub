"use server";

const getBaseUrl = () =>
  (
    process.env.RESELL_SERVER_URL ||
    process.env.NEXT_PUBLIC_RESELL_SERVER_URL ||
    "http://localhost:5000"
  ).replace(/\/$/, "");

async function executeFetch(endpoint, options = {}) {
  try {
    const mod = await import("../api-client.js");
    if (mod && typeof mod.serverFetch === "function") {
      return await mod.serverFetch(endpoint, options);
    }
  } catch (err) {
    if (typeof err?.digest === "string" && err.digest.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    // Fallback to direct fetch in standalone node/test environments
  }

  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  return fetch(url, options);
}

export const getSingleProduct = async (id) => {
  const res = await executeFetch(`/api/products/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    if (res.status === 403) {
      try {
        const errorData = await res.clone().json();
        if (errorData?.code === "ACCOUNT_BLOCKED") {
          const nav = await import("next/navigation.js").catch(() => null);
          if (nav && typeof nav.redirect === "function") {
            nav.redirect("/account/blocked");
          }
        }
      } catch (err) {
        if (typeof err?.digest === "string" && err.digest.startsWith("NEXT_REDIRECT")) {
          throw err;
        }
      }
    }
    throw new Error(`Failed to fetch product: HTTP ${res.status}`);
  }

  return res.json();
};
