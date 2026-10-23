"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ShoppingBag, PlusCircle, Sparkles, ShieldCheck } from "lucide-react";

export default function CallToAction() {
  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-[#0b0f19] transition-colors overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-8 sm:p-14 lg:p-16 text-white shadow-2xl overflow-hidden">
          {/* Subtle decorative background circles */}
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-cyan-400/15 blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-100"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Join 120,000+ Smart Buyers & Sellers
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight"
            >
              Ready to Give Quality Items a Second Life?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg text-emerald-100 leading-relaxed max-w-2xl mx-auto"
            >
              Whether you are decluttering your home or looking for verified pre-owned gadgets at unmatched prices, ReSell Hub provides safe, trusted transactions.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <Link
                  href="/products"
                  className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white text-emerald-800 font-bold text-sm sm:text-base shadow-lg hover:bg-emerald-50 transition"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Explore Marketplace
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <Link
                  href="/dashboard/seller/products/add-products"
                  className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-950/60 text-white font-bold text-sm sm:text-base border border-white/20 transition backdrop-blur-md"
                >
                  <PlusCircle className="w-4 h-4" />
                  List Item for Sale
                </Link>
              </motion.div>
            </motion.div>

            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-emerald-100/80 font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                Verified Community Sellers
              </span>
              <span>·</span>
              <span>Instant Stripe Checkout</span>
              <span>·</span>
              <span>Circular Economy Champions</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
