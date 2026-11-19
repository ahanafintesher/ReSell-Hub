"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ExternalLink } from "lucide-react";
import { motion } from "motion/react";

const WishlistCard = ({ item, onRemove }) => {
  const product = item.product || item;
  const imageSrc =
    typeof product.image === "string" && product.image.trim().length > 0
      ? product.image.trim()
      : null;

  const isSold = product.status === "sold";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className="border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 bg-white dark:bg-slate-900/90 shadow-xs hover:shadow-md transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="relative w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200/60 dark:border-slate-800 flex items-center justify-center">
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={product.title || "Product"}
                width={80}
                height={80}
                className={`w-full h-full object-cover ${isSold ? "opacity-60 grayscale-25" : ""}`}
                unoptimized
              />
            ) : (
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">No Image</span>
            )}
            {isSold && (
              <span className="absolute top-1 left-1 bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                Sold
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50 capitalize">
                {product.category || "General"}
              </span>
              {product.condition && (
                <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                  · {product.condition}
                </span>
              )}
            </div>

            <Link
              href={`/products/${product._id}`}
              className="mt-1 block font-bold text-slate-900 dark:text-white hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors truncate text-base"
            >
              {product.title}
            </Link>

            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Added on{" "}
              {item.createdAt
                ? new Date(item.createdAt).toLocaleDateString()
                : "Recently"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 dark:text-slate-500 block font-medium">Price</span>
            <span className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400">
              ৳{product.price ?? "N/A"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/products/${product._id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition"
            >
              <span>View</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={() => onRemove?.(item._id)}
              className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition border border-slate-200 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-800 cursor-pointer"
              title="Remove from wishlist"
              aria-label="Remove from wishlist"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WishlistCard;