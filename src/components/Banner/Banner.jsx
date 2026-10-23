"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ShoppingBag,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Zap,
} from "lucide-react";

// Dynamically import Three.js Hero Scene with no SSR
const HeroScene = dynamic(() => import("../3D/HeroScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[380px] flex items-center justify-center">
      <div className="w-48 h-48 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
    </div>
  ),
});

export default function HeroBanner() {
  return (
    <section
      id="hero-banner"
      className="relative w-full overflow-hidden bg-slate-50/70 dark:bg-[#0b0f19] border-b border-slate-200/60 dark:border-slate-800/80 transition-colors duration-300"
    >
      {/* Ambient background lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-cyan-500/10 dark:bg-cyan-500/15 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-violet-500/5 dark:bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Headline, Copy, CTAs, Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 text-center lg:text-left space-y-6"
          >
            {/* Circular Marketplace Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-100/90 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/60 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Verified Circular Marketplace</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              Give Quality Items a{" "}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 bg-clip-text text-transparent">
                Second Life.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Buy and sell pre-owned electronics, audio gear, accessories, and home goods with confidence. Verified condition, transparent pricing, and zero landfill waste.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-1">
              <Link href="/products" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm sm:text-base shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Explore Marketplace
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>

              <Link
                href="/dashboard/seller/products/add-products"
                className="w-full sm:w-auto"
              >
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold text-sm sm:text-base shadow-xs transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Start Selling
                </motion.button>
              </Link>
            </div>

            {/* Quick Value Proof Points */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-5 sm:gap-6 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Verified Sellers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span>Instant Checkout</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
                <span>Buyer Protection</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Three.js Interactive 3D Visual Experience */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 relative flex items-center justify-center"
          >
            {/* Card wrapper for 3D view */}
            <div className="relative w-full aspect-square max-w-[460px] rounded-3xl p-2 bg-gradient-to-b from-white/60 to-white/20 dark:from-slate-900/60 dark:to-slate-900/20 border border-slate-200/80 dark:border-slate-800 shadow-xl backdrop-blur-md overflow-hidden">
              <HeroScene />

              {/* Floating micro-badges around the 3D scene */}
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 shadow-md backdrop-blur-md"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Verified Quality</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="absolute bottom-4 right-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 shadow-md backdrop-blur-md"
              >
                <RotateCcw className="w-3.5 h-3.5 text-cyan-500" />
                <span>Circular Lifecycle</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}