import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { getFeaturedProducts } from "@/lib/actions/getProducts";
import ProductsCard from "../ProductsCard/ProductsCard";

export default async function FeaturedProducts() {
  let products = [];
  try {
    products = await getFeaturedProducts();
  } catch (err) {
    console.error("Failed to fetch featured products:", err);
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-20 bg-white dark:bg-[#0b0f19] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 mb-2">
              <Flame className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Handpicked Deals
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Featured Listings
            </h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm sm:text-base">
              Top-rated pre-owned gadgets, electronics, and fashion items ready to ship.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:gap-3 transition-all self-start sm:self-auto"
          >
            Browse All Products
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Products Grid */}
        <ProductsCard products={products} />
      </div>
    </section>
  );
}
