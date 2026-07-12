import ProductsFilters from "@/components/ProductsCard/ProductsFilter";
import { getProducts } from "@/lib/actions/getProducts";

export default async function ProductsPage({ searchParams }) {
  // URL থেকে params পড়ি
  const params = await searchParams;
  const search = params?.search || "";
  const category = params?.category || "all";

  // Backend query করি filter সহ
  const products = await getProducts({ search, category });

  return (
    <main className="container mx-auto max-w-7xl px-6 py-12">
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-default-900">Our Products</h1>
        <p className="mt-2 text-default-500">
          Discover our latest tech gadgets and accessories.
        </p>
      </div>

      {/* Pass current filters to client component */}
      <ProductsFilters 
        products={products}
        currentSearch={search}
        currentCategory={category}
      />
    </main>
  );
}