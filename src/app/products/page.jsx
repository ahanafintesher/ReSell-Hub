import ProductsFilters from "@/components/ProductsCard/ProductsFilter";
import { getProducts } from "@/lib/actions/getProducts";

export const metadata = {
  title: "Products Catalog | ReSell Hub",
  description: "Browse pre-owned electronics, audio gear, accessories, and second-hand items with verified pricing on ReSell Hub.",
};

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;
  const search = params?.search || "";
  const category = params?.category || "all";
  const condition = params?.condition || "all";
  const minPrice = params?.minPrice || "";
  const maxPrice = params?.maxPrice || "";
  const sort = params?.sort || "newest";
  const page = parseInt(params?.page || "1", 10);
  const limit = 12;

  // Backend query with all filters & bounded pagination
  let products = [];
  let total = 0;
  let totalPages = 1;
  let fetchError = null;

  try {
    const res = await getProducts({
      search,
      category,
      condition,
      status: "available",
      minPrice,
      maxPrice,
      sort,
      page,
      limit,
    });

    const isPubliclyAvailable = (p) =>
      p &&
      p.status !== "pending" &&
      p.status !== "rejected" &&
      p.moderationStatus !== "rejected" &&
      p.moderationStatus !== "pending";

    if (Array.isArray(res)) {
      products = res.filter(isPubliclyAvailable);
      total = products.length;
      totalPages = Math.ceil(total / limit) || 1;
    } else if (res && typeof res === "object") {
      const rawProducts = Array.isArray(res.products) ? res.products : [];
      products = rawProducts.filter(isPubliclyAvailable);
      total = typeof res.total === "number" ? res.total : products.length;
      totalPages =
        typeof res.totalPages === "number"
          ? res.totalPages
          : Math.ceil(total / limit) || 1;
    }
  } catch (err) {
    console.error("Failed to load products:", err);
    fetchError =
      err.message || "Failed to load products. Please check your connection and try again.";
  }

  return (
    <main className="container mx-auto max-w-7xl px-4 sm:px-6 py-10">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Marketplace Catalog
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm sm:text-base">
          Browse verified pre-owned items from trusted community sellers.
        </p>
      </div>

      {/* Pass current filters to client component */}
      <ProductsFilters
        products={products}
        total={total}
        totalPages={totalPages}
        errorMessage={fetchError}
        currentSearch={search}
        currentCategory={category}
        currentCondition={condition}
        currentMinPrice={minPrice}
        currentMaxPrice={maxPrice}
        currentSort={sort}
        currentPage={page}
        pageSize={limit}
      />
    </main>
  );
}