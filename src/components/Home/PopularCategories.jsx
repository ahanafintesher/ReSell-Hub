"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Laptop,
  Headphones,
  Watch,
  Plug,
  Shirt,
  Armchair,
  Car,
  Smartphone,
  ArrowRight,
  Sparkles,
  Package,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { getFeaturedCategories } from "@/lib/actions/categories";

const PRESENTATION_META = {
  Electronics: {
    icon: Laptop,
    gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
    iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400",
    badge: "Computers & Displays",
    border: "hover:border-blue-300 dark:hover:border-blue-700",
  },
  Audio: {
    icon: Headphones,
    gradient: "from-purple-500/10 via-purple-500/5 to-transparent",
    iconBg:
      "bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400",
    badge: "Headphones & Speakers",
    border: "hover:border-purple-300 dark:hover:border-purple-700",
  },
  Wearables: {
    icon: Watch,
    gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    iconBg:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
    badge: "Smartwatches & Bands",
    border: "hover:border-emerald-300 dark:hover:border-emerald-700",
  },
  Accessories: {
    icon: Plug,
    gradient: "from-amber-500/10 via-amber-500/5 to-transparent",
    iconBg:
      "bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400",
    badge: "Peripherals & Docks",
    border: "hover:border-amber-300 dark:hover:border-amber-700",
  },
  Fashion: {
    icon: Shirt,
    gradient: "from-rose-500/10 via-rose-500/5 to-transparent",
    iconBg: "bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400",
    badge: "Vintage & Apparel",
    border: "hover:border-rose-300 dark:hover:border-rose-700",
  },
  Furniture: {
    icon: Armchair,
    gradient: "from-orange-500/10 via-orange-500/5 to-transparent",
    iconBg:
      "bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400",
    badge: "Chairs & Desks",
    border: "hover:border-orange-300 dark:hover:border-orange-700",
  },
  Vehicles: {
    icon: Car,
    gradient: "from-cyan-500/10 via-cyan-500/5 to-transparent",
    iconBg: "bg-cyan-100 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400",
    badge: "Bikes & Scooters",
    border: "hover:border-cyan-300 dark:hover:border-cyan-700",
  },
  "Mobile Phones": {
    icon: Smartphone,
    gradient: "from-teal-500/10 via-teal-500/5 to-transparent",
    iconBg: "bg-teal-100 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400",
    badge: "Phones & Tablets",
    border: "hover:border-teal-300 dark:hover:border-teal-700",
  },
};

const DEFAULT_META = {
  icon: Package,
  gradient: "from-slate-500/10 via-slate-500/5 to-transparent",
  iconBg: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  badge: "Marketplace Items",
  border: "hover:border-slate-300 dark:hover:border-slate-700",
};

export default function PopularCategories({
  initialCategories = [],
  initialError = null,
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError);

  const handleRetry = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getFeaturedCategories();
      if (res.success) {
        setCategories(res.data);
      } else {
        setError(res.error || "Failed to load featured categories");
      }
    } catch (err) {
      setError(err.message || "Failed to load featured categories");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <section className="py-16 sm:py-20 bg-slate-50/60 dark:bg-[#0c121e]/70 border-y border-slate-200/60 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Verified Marketplace
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Explore Popular Categories
            </h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm sm:text-base">
              Find pre-owned quality products across carefully curated
              categories.
            </p>
          </div>

          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:gap-3 transition-all self-start sm:self-auto"
          >
            All Categories
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Loading Skeleton State */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {[...Array(8)].map((_, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 animate-pulse h-48"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 mb-4" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-2.5" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-full mb-1.5" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-2/3" />
                </div>
                <div className="h-3 bg-slate-100 dark:bg-slate-800/80 rounded w-16 mt-4" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && categories.length === 0 && (
          <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-red-200 dark:border-red-900/50 bg-red-50/40 dark:bg-red-950/20">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Unable to load popular categories
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Please check your connection or try again.
            </p>
            <button
              type="button"
              onClick={handleRetry}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && categories.length === 0 && (
          <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
            <Package className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              No featured categories available at this moment.
            </p>
          </div>
        )}

        {/* Categories Grid */}
        {!loading && categories.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {categories.map((cat, idx) => {
              const meta = PRESENTATION_META[cat.name] || DEFAULT_META;
              const Icon = meta.icon;

              return (
                <motion.div
                  key={cat._id || cat.name}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <Link
                    href={`/products?category=${encodeURIComponent(cat.name)}`}
                    className={`group relative flex flex-col justify-between p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:shadow-lg transition-all duration-300 ${meta.border} overflow-hidden h-full`}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${meta.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                    />

                    <div className="relative z-10">
                      <div
                        className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${meta.iconBg} transition-transform duration-300 group-hover:scale-110`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {cat.description || meta.badge}
                      </p>
                    </div>

                    <div className="relative z-10 mt-4 flex items-center gap-1 text-xs font-semibold text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      <span>Browse</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
