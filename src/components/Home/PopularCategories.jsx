"use client";

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
} from "lucide-react";

const CATEGORIES = [
  {
    name: "Electronics",
    icon: Laptop,
    gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
    iconBg: "bg-blue-100 text-blue-600",
    badge: "Computers & Displays",
    border: "hover:border-blue-300",
  },
  {
    name: "Audio",
    icon: Headphones,
    gradient: "from-purple-500/10 via-purple-500/5 to-transparent",
    iconBg: "bg-purple-100 text-purple-600",
    badge: "Headphones & Speakers",
    border: "hover:border-purple-300",
  },
  {
    name: "Wearables",
    icon: Watch,
    gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    iconBg: "bg-emerald-100 text-emerald-600",
    badge: "Smartwatches & Bands",
    border: "hover:border-emerald-300",
  },
  {
    name: "Accessories",
    icon: Plug,
    gradient: "from-amber-500/10 via-amber-500/5 to-transparent",
    iconBg: "bg-amber-100 text-amber-600",
    badge: "Peripherals & Docks",
    border: "hover:border-amber-300",
  },
  {
    name: "Fashion",
    icon: Shirt,
    gradient: "from-rose-500/10 via-rose-500/5 to-transparent",
    iconBg: "bg-rose-100 text-rose-600",
    badge: "Vintage & Apparel",
    border: "hover:border-rose-300",
  },
  {
    name: "Mobile Phones",
    icon: Smartphone,
    gradient: "from-teal-500/10 via-teal-500/5 to-transparent",
    iconBg: "bg-teal-100 text-teal-600",
    badge: "Phones & Tablets",
    border: "hover:border-teal-300",
  },
  {
    name: "Furniture",
    icon: Armchair,
    gradient: "from-orange-500/10 via-orange-500/5 to-transparent",
    iconBg: "bg-orange-100 text-orange-600",
    badge: "Chairs & Desks",
    border: "hover:border-orange-300",
  },
  {
    name: "Vehicles",
    icon: Car,
    gradient: "from-cyan-500/10 via-cyan-500/5 to-transparent",
    iconBg: "bg-cyan-100 text-cyan-600",
    badge: "Bikes & Scooters",
    border: "hover:border-cyan-300",
  },
];

export default function PopularCategories() {
  return (
    <section className="py-16 sm:py-20 bg-slate-50/60 border-y border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Verified Marketplace
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Explore Popular Categories
            </h2>
            <p className="mt-2 text-slate-500 text-sm sm:text-base">
              Find pre-owned quality products across carefully curated categories.
            </p>
          </div>

          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:gap-3 transition-all self-start sm:self-auto"
          >
            All Categories
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <Link
                  href={`/products?category=${encodeURIComponent(cat.name)}`}
                  className={`group relative flex flex-col justify-between p-5 rounded-2xl border border-slate-200/80 bg-white hover:shadow-lg transition-all duration-300 ${cat.border} overflow-hidden h-full`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                  />

                  <div className="relative z-10">
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${cat.iconBg} transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{cat.badge}</p>
                  </div>

                  <div className="relative z-10 mt-4 flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-emerald-600 transition-colors">
                    <span>Browse</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
