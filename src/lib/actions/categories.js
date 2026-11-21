'use server';

/**
 * Category API helper for ReSell Hub
 * Endpoints:
 * - GET /api/v1/categories (All active categories)
 * - GET /api/v1/featured   (Curated featured categories)
 *
 * Public endpoints - no authentication token or Better Auth session required.
 */

const getBaseUrl = () => {
  return (
    process.env.RESELL_SERVER_URL ||
    process.env.NEXT_PUBLIC_RESELL_SERVER_URL ||
    "http://localhost:5000"
  ).replace(/\/$/, "");
};

/**
 * Validates a category record from the API response
 */
function isValidCategory(cat) {
  return (
    cat !== null &&
    typeof cat === "object" &&
    typeof cat.name === "string" &&
    cat.name.trim().length > 0
  );
}

/**
 * Fetches all categories from the backend
 * @returns {Promise<{ success: boolean, data: Array, error: string|null }>}
 */
export async function getAllCategories() {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/v1/categories`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 60 },
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return {
        success: false,
        data: [],
        error: `Failed to load categories (HTTP ${res.status})`,
      };
    }

    const payload = await res.json();

    if (!payload || payload.success !== true || !Array.isArray(payload.data)) {
      return {
        success: false,
        data: [],
        error: "Malformed category response received from server",
      };
    }

    const validCategories = payload.data.filter(isValidCategory);

    return {
      success: true,
      data: validCategories,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      data: [],
      error: err.message || "Network error fetching categories",
    };
  }
}

/**
 * Fetches featured categories from the backend
 * @returns {Promise<{ success: boolean, data: Array, error: string|null }>}
 */
export async function getFeaturedCategories() {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/v1/featured`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 60 },
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return {
        success: false,
        data: [],
        error: `Failed to load featured categories (HTTP ${res.status})`,
      };
    }

    const payload = await res.json();

    if (!payload || payload.success !== true || !Array.isArray(payload.data)) {
      return {
        success: false,
        data: [],
        error: "Malformed featured category response received from server",
      };
    }

    const validCategories = payload.data.filter(isValidCategory);

    return {
      success: true,
      data: validCategories,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      data: [],
      error: err.message || "Network error fetching featured categories",
    };
  }
}
