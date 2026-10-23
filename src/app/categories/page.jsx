import Link from "next/link";
import { Sparkles, Home, ChevronRight, Layers } from "lucide-react";
import CategoryExplorer from "@/components/Categories/CategoryExplorer";

export const metadata = {
  title: "Explore Categories | ReSell Hub",
  description:
    "Browse verified pre-owned products across all marketplace categories on ReSell Hub. Sustainable shopping with trusted community sellers.",
};

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] dark:bg-[#080d1a] transition-colors py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10 sm:space-y-12">
        {/* Category Page Hero Header */}
        <div className="relative text-center max-w-3xl mx-auto pt-2 sm:pt-4">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-72 h-44 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Breadcrumb Navigation */}
          <nav
            aria-label="Breadcrumb"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 mb-6 shadow-xs"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-800 dark:text-slate-200 font-semibold">
              Categories
            </span>
          </nav>

          {/* Directory Badge */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/40 dark:border-emerald-700/50">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Circular Marketplace Directory
            </span>
          </div>

          {/* Main Page Heading */}
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Find Your Next{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
              Favorite
            </span>
          </h1>

          {/* Supporting Copy */}
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Give quality pre-owned goods a second life. Browse our verified collections across technology, fashion, lifestyle, and mobility — certified by community ratings.
          </p>
        </div>

        {/* Interactive Category Search, Filter Chips & Cards Grid */}
        <CategoryExplorer />
      </div>
    </main>
  );
}
