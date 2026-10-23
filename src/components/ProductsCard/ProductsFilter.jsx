"use client";

import { useTransition, useRef, useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, Filter, RotateCcw, ChevronLeft, ChevronRight, X, ArrowUpDown, Tag } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ProductsCard from "./ProductsCard";

const CATEGORIES = [
  "All Categories",
  "Electronics",
  "Audio",
  "Wearables",
  "Accessories",
  "Fashion",
  "Furniture",
  "Vehicles",
  "Mobile Phones",
  "Others",
];

const CONDITIONS = [
  "All Conditions",
  "New",
  "Like New",
  "Used - Excellent",
  "Used - Good",
  "Used - Fair",
];

const SORT_OPTIONS = [
  { id: "newest", label: "Newest First" },
  { id: "price-low-to-high", label: "Price: Low to High" },
  { id: "price-high-to-low", label: "Price: High to Low" },
];

export default function ProductsFilters({
  products,
  currentSearch = "",
  currentCategory = "all",
  currentCondition = "all",
  currentMinPrice = "",
  currentMaxPrice = "",
  currentSort = "newest",
  currentPage = 1,
  pageSize = 12,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const searchTimeoutRef = useRef(null);

  const [minPriceInput, setMinPriceInput] = useState(currentMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(currentMaxPrice);
  const [prevPrices, setPrevPrices] = useState({ min: currentMinPrice, max: currentMaxPrice });

  if (prevPrices.min !== currentMinPrice || prevPrices.max !== currentMaxPrice) {
    setPrevPrices({ min: currentMinPrice, max: currentMaxPrice });
    setMinPriceInput(currentMinPrice);
    setMaxPriceInput(currentMaxPrice);
  }

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const updateFilters = (updates) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "" && value !== "all") {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });

    // If changing filters other than page, reset page to 1
    if (!("page" in updates)) {
      params.delete("page");
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      updateFilters({ search: value });
    }, 350);
  };

  const handlePriceApply = (e) => {
    e.preventDefault();
    updateFilters({
      minPrice: minPriceInput,
      maxPrice: maxPriceInput,
    });
  };

  const handleReset = () => {
    setMinPriceInput("");
    setMaxPriceInput("");
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasActiveFilters =
    currentSearch !== "" ||
    (currentCategory !== "all" && currentCategory !== "") ||
    (currentCondition !== "all" && currentCondition !== "") ||
    currentMinPrice !== "" ||
    currentMaxPrice !== "" ||
    currentSort !== "newest";

  const hasNextPage = products.length >= pageSize;

  return (
    <div className="space-y-6">
      {/* Controls Container */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-xs space-y-4"
      >
        {/* Top Row: Search + Category + Condition + Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="search"
              aria-label="Search listings"
              placeholder="Search by title..."
              defaultValue={currentSearch}
              onChange={handleSearchChange}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              aria-label="Filter by Category"
              value={currentCategory === "all" ? "" : currentCategory}
              onChange={(e) => updateFilters({ category: e.target.value || "all" })}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer capitalize"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat === "All Categories" ? "" : cat} className="dark:bg-slate-900 dark:text-slate-200">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Condition Dropdown */}
          <div className="relative">
            <select
              aria-label="Filter by Condition"
              value={currentCondition === "all" ? "" : currentCondition}
              onChange={(e) => updateFilters({ condition: e.target.value || "all" })}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
            >
              {CONDITIONS.map((cond) => (
                <option key={cond} value={cond === "All Conditions" ? "" : cond} className="dark:bg-slate-900 dark:text-slate-200">
                  {cond}
                </option>
              ))}
            </select>
          </div>

          {/* Sorting Dropdown */}
          <div className="relative">
            <select
              aria-label="Sort products"
              value={currentSort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id} className="dark:bg-slate-900 dark:text-slate-200">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Second Row: Price Range + Quick Reset */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Price Range Inputs */}
          <form onSubmit={handlePriceApply} className="flex items-center gap-2 flex-wrap text-xs text-slate-600 dark:text-slate-300">
            <span className="font-semibold text-slate-500 dark:text-slate-400">Price (৳):</span>
            <input
              type="number"
              placeholder="Min"
              min="0"
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              className="w-24 h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            <span className="text-slate-400 dark:text-slate-500">—</span>
            <input
              type="number"
              placeholder="Max"
              min="0"
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
              className="w-24 h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="h-9 px-3 rounded-lg bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-medium text-xs hover:bg-slate-900 transition-colors cursor-pointer"
            >
              Apply
            </button>
          </form>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors border border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-800/60 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
          )}
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex items-center gap-1.5 flex-wrap pt-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Active:
            </span>
            {currentSearch && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                Search: &quot;{currentSearch}&quot;
                <button
                  onClick={() => updateFilters({ search: "" })}
                  className="hover:text-emerald-950 dark:hover:text-emerald-100 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {currentCategory && currentCategory !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 capitalize">
                Category: {currentCategory}
                <button
                  onClick={() => updateFilters({ category: "all" })}
                  className="hover:text-blue-950 dark:hover:text-blue-100 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {currentCondition && currentCondition !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50">
                Condition: {currentCondition}
                <button
                  onClick={() => updateFilters({ condition: "all" })}
                  className="hover:text-purple-950 dark:hover:text-purple-100 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {(currentMinPrice || currentMaxPrice) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                Price: ৳{currentMinPrice || 0} - ৳{currentMaxPrice || "Any"}
                <button
                  onClick={() => updateFilters({ minPrice: "", maxPrice: "" })}
                  className="hover:text-amber-950 dark:hover:text-amber-100 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </motion.div>

      {/* Loading Bar when transitioning */}
      {isPending && (
        <div className="flex items-center justify-center gap-2 py-2 text-emerald-700 dark:text-emerald-400 text-xs font-medium animate-pulse">
          <div className="w-3.5 h-3.5 border-2 border-emerald-600 dark:border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span>Updating catalog results...</span>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <p>
          Showing <span className="font-bold text-slate-800 dark:text-slate-200">{products.length}</span>{" "}
          items on Page {currentPage}
          {hasActiveFilters && " (Filtered)"}
        </p>
      </div>

      {/* Product Grid or Empty State */}
      {products.length > 0 ? (
        <ProductsCard products={products} />
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-12 text-center shadow-xs"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mb-4">
            <Search className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            No products matched your criteria
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Try adjusting your keyword search, clearing price boundaries, or selecting a broader category.
          </p>
          {hasActiveFilters && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm shadow-xs hover:bg-emerald-700 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Clear All Filters
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={() => updateFilters({ page: Math.max(1, currentPage - 1) })}
          disabled={currentPage <= 1 || isPending}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          Page {currentPage}
        </span>

        <button
          onClick={() => updateFilters({ page: currentPage + 1 })}
          disabled={!hasNextPage || isPending}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
