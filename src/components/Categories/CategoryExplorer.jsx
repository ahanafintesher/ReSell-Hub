"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  X,
  ArrowRight,
  Sparkles,
  Laptop,
  Headphones,
  Watch,
  Plug,
  Shirt,
  Armchair,
  Car,
  Smartphone,
  Package,
  PlusCircle,
  ShieldCheck,
  Tag,
} from "lucide-react";

export const CATEGORIES_DATA = [
  {
    id: "Electronics",
    name: "Electronics",
    description: "Laptops, computers, displays, and consumer electronics tested and ready for use.",
    icon: Laptop,
    group: "tech",
    badge: "Tech & Work",
    badgeStyle: "bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60",
    iconStyle: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 ring-1 ring-blue-500/20",
    glowColor: "group-hover:shadow-[0_12px_36px_rgba(59,130,246,0.18)]",
  },
  {
    id: "Audio",
    name: "Audio",
    description: "Noise-cancelling headphones, wireless earbuds, premium speakers, and hi-fi gear.",
    icon: Headphones,
    group: "tech",
    badge: "Sound Gear",
    badgeStyle: "bg-purple-50 text-purple-700 border-purple-200/60 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60",
    iconStyle: "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 ring-1 ring-purple-500/20",
    glowColor: "group-hover:shadow-[0_12px_36px_rgba(139,92,246,0.18)]",
  },
  {
    id: "Wearables",
    name: "Wearables",
    description: "Smartwatches, fitness bands, health sensors, and wearable smart accessories.",
    icon: Watch,
    group: "tech",
    badge: "Smart Fitness",
    badgeStyle: "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60",
    iconStyle: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 ring-1 ring-emerald-500/20",
    glowColor: "group-hover:shadow-[0_12px_36px_rgba(16,185,129,0.18)]",
  },
  {
    id: "Accessories",
    name: "Accessories",
    description: "Ergonomic keyboards, mice, docking stations, chargers, and workspace cables.",
    icon: Plug,
    group: "tech",
    badge: "Workspace Essentials",
    badgeStyle: "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60",
    iconStyle: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 ring-1 ring-amber-500/20",
    glowColor: "group-hover:shadow-[0_12px_36px_rgba(245,158,11,0.18)]",
  },
  {
    id: "Fashion",
    name: "Fashion",
    description: "Curated vintage apparel, jackets, shoes, designer streetwear, and everyday accessories.",
    icon: Shirt,
    group: "lifestyle",
    badge: "Vintage & Streetwear",
    badgeStyle: "bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60",
    iconStyle: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 ring-1 ring-rose-500/20",
    glowColor: "group-hover:shadow-[0_12px_36px_rgba(244,63,94,0.18)]",
  },
  {
    id: "Furniture",
    name: "Furniture",
    description: "Solid wood work desks, ergonomic task chairs, lighting, and living spaces.",
    icon: Armchair,
    group: "lifestyle",
    badge: "Living & Office",
    badgeStyle: "bg-orange-50 text-orange-700 border-orange-200/60 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800/60",
    iconStyle: "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 ring-1 ring-orange-500/20",
    glowColor: "group-hover:shadow-[0_12px_36px_rgba(249,115,22,0.18)]",
  },
  {
    id: "Vehicles",
    name: "Vehicles",
    description: "Commuter bicycles, electric scooters, cycling helmets, and travel equipment.",
    icon: Car,
    group: "mobility",
    badge: "Mobility & E-Rides",
    badgeStyle: "bg-cyan-50 text-cyan-700 border-cyan-200/60 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800/60",
    iconStyle: "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400 ring-1 ring-cyan-500/20",
    glowColor: "group-hover:shadow-[0_12px_36px_rgba(6,182,212,0.18)]",
  },
  {
    id: "Mobile Phones",
    name: "Mobile Phones",
    description: "Certified pre-owned smartphones, tablets, styluses, and protective cases.",
    icon: Smartphone,
    group: "tech",
    badge: "Handheld Devices",
    badgeStyle: "bg-teal-50 text-teal-700 border-teal-200/60 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800/60",
    iconStyle: "bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400 ring-1 ring-teal-500/20",
    glowColor: "group-hover:shadow-[0_12px_36px_rgba(20,184,166,0.18)]",
  },
  {
    id: "Others",
    name: "Others",
    description: "Collector's books, instruments, cameras, tools, hobby supplies, and rare finds.",
    icon: Package,
    group: "lifestyle",
    badge: "Collectibles & Misc",
    badgeStyle: "bg-slate-100 text-slate-700 border-slate-300/60 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    iconStyle: "bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400 ring-1 ring-slate-500/20",
    glowColor: "group-hover:shadow-[0_12px_36px_rgba(100,116,139,0.18)]",
  },
];

const FILTER_GROUPS = [
  { id: "all", label: "All Categories" },
  { id: "tech", label: "Electronics & Tech" },
  { id: "lifestyle", label: "Fashion & Home" },
  { id: "mobility", label: "Mobility & More" },
];

export default function CategoryExplorer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState("all");

  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return CATEGORIES_DATA.filter((cat) => {
      const matchesGroup = activeGroup === "all" || cat.group === activeGroup;
      if (!matchesGroup) return false;
      if (!q) return true;
      return (
        cat.name.toLowerCase().includes(q) ||
        cat.description.toLowerCase().includes(q) ||
        cat.badge.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, activeGroup]);

  return (
    <div className="w-full space-y-10">
      {/* Search & Filter Bar */}
      <div className="bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Keyword Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category by name, keyword, or item type..."
              aria-label="Search categories"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Result Counter */}
          <div className="flex items-center justify-between md:justify-end gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
              <Tag className="w-3.5 h-3.5 text-emerald-500" />
              Showing {filteredCategories.length} of {CATEGORIES_DATA.length} Categories
            </span>
          </div>
        </div>

        {/* Group Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          {FILTER_GROUPS.map((group) => {
            const isActive = activeGroup === group.id;
            return (
              <button
                key={group.id}
                type="button"
                onClick={() => setActiveGroup(group.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/20"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                {group.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories Grid */}
      <AnimatePresence mode="popLayout">
        {filteredCategories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="text-center py-16 px-4 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 ring-1 ring-emerald-500/20">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No categories match &ldquo;{searchQuery}&rdquo;
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Try searching with a broader keyword such as &ldquo;tech&rdquo;, &ldquo;audio&rdquo;, &ldquo;phone&rdquo;, or reset filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveGroup("all");
              }}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
            >
              Reset Search & Filters
            </button>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
          >
            {filteredCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={cat.id}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                  }}
                  whileHover={{ y: -6 }}
                  className="group"
                >
                  <Link
                    href={`/products?category=${encodeURIComponent(cat.name)}`}
                    className={`relative flex flex-col justify-between h-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 shadow-sm ${cat.glowColor} transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500`}
                  >
                    <div>
                      {/* Top Row: Icon + Honest Badge */}
                      <div className="flex items-center justify-between mb-5">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl ${cat.iconStyle} transition-transform duration-300 group-hover:scale-110`}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${cat.badgeStyle}`}
                        >
                          {cat.badge}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {cat.name}
                      </h2>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>

                    {/* Bottom Action Indicator */}
                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="flex items-center gap-1.5">
                        Explore {cat.name}
                      </span>
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1.5" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Seller CTA matching brand aesthetic */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-8 sm:p-10 text-white shadow-xl"
      >
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-cyan-400/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Circular Commerce Platform
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Have items you no longer use?
            </h3>
            <p className="text-sm sm:text-base text-emerald-100 leading-relaxed">
              Turn your pre-owned electronics, furniture, or fashion into cash in minutes. Join thousands of verified community sellers giving quality items a second life.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-emerald-100/90 font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                Verified Buyer Community
              </span>
              <span>·</span>
              <span>Zero Listing Fees</span>
              <span>·</span>
              <span>Secure Stripe Payouts</span>
            </div>
          </div>

          <div className="flex-shrink-0">
            <Link
              href="/dashboard/seller/products/add-products"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white text-emerald-800 font-bold text-sm sm:text-base shadow-lg hover:bg-emerald-50 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              List Item for Sale
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
