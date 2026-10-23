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
  try {
    const res = await getProducts({
      search,
      category,
      condition,
      minPrice,
      maxPrice,
      sort,
      page,
      limit,
    });
    products = Array.isArray(res) ? res : [];
  } catch (err) {
    console.error("Failed to load products:", err);
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