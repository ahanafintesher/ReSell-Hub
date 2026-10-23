"use client";

import { Card, Button } from "@heroui/react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import WishlistButton from "../wishlist/WishlistButon";

const categoryPillStyles = {
  audio: "bg-purple-100 text-purple-800 border-purple-200",
  wearables: "bg-emerald-100 text-emerald-800 border-emerald-200",
  electronics: "bg-blue-100 text-blue-800 border-blue-200",
  accessories: "bg-amber-100 text-amber-800 border-amber-200",
  fashion: "bg-rose-100 text-rose-800 border-rose-200",
  furniture: "bg-orange-100 text-orange-800 border-orange-200",
  vehicles: "bg-cyan-100 text-cyan-800 border-cyan-200",
  "mobile phones": "bg-teal-100 text-teal-800 border-teal-200",
};

export default function ProductsCard({ products }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product, index) => {
        const formattedPrice = product.price
          ? parseFloat(product.price).toLocaleString("en-US", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })
          : "0";

        const imageSrc =
          typeof product.image === "string" && product.image.trim().length > 0
            ? product.image.trim()
            : null;

        const isSold = product.status === "sold";
        const catKey = (product.category || "").toLowerCase();
        const catBadgeStyle =
          categoryPillStyles[catKey] ||
          "bg-slate-100 text-slate-700 border-slate-200";

        return (
          <motion.div
            key={product._id || product.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4) }}
            whileHover={{ y: -4 }}
            className="h-full"
          >
            <Card className="h-full border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between rounded-2xl overflow-hidden">
              {/* Semantic Link wrapping card header and content */}
              <Link
                href={`/products/${product._id || product.id}`}
                className="group block text-left focus:outline-none flex-1"
              >
                <Card.Header className="pb-0 pt-3 px-4 flex-col items-start">
                  <div className="flex justify-between w-full items-center gap-2">
                    <span
                      className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${catBadgeStyle}`}
                    >
                      {product.category || "General"}
                    </span>
                    <p className="text-base font-bold text-emerald-700">
                      ৳{formattedPrice}
                    </p>
                  </div>

                  <Card.Title className="font-bold text-lg mt-2.5 text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                    {product.name || product.title}
                  </Card.Title>

                  <Card.Description className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {product.description || "Pre-owned verified product on ReSell Hub."}
                  </Card.Description>
                </Card.Header>

                <Card.Content className="overflow-visible py-3 px-4">
                  <div className="relative overflow-hidden rounded-xl bg-slate-50 aspect-square flex items-center justify-center">
                    {isSold && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="bg-rose-600 text-white font-bold text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full shadow-sm">
                          Sold Out
                        </span>
                      </div>
                    )}

                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt={product.title || "Product"}
                        width={300}
                        height={300}
                        className={`w-full h-full object-cover rounded-xl aspect-square transition-transform duration-300 group-hover:scale-105 ${
                          isSold ? "opacity-75 grayscale-25" : ""
                        }`}
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                        No Image Available
                      </div>
                    )}
                  </div>
                </Card.Content>
              </Link>

              <Card.Footer className="justify-between items-center gap-2 pt-0 px-4 pb-4">
                <div className="text-xs text-slate-400 font-medium capitalize">
                  {product.condition || "Used"}
                </div>

                <div className="flex items-center gap-2">
                  <WishlistButton product={product} />

                  {isSold ? (
                    <Button
                      disabled
                      className="bg-slate-100 text-slate-400 font-medium text-xs cursor-not-allowed px-3 py-1.5 rounded-full"
                      size="sm"
                    >
                      Sold Out
                    </Button>
                  ) : (
                    <Link href={`/products/${product._id || product.id}`}>
                      <Button
                        className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold shadow-xs text-xs px-3.5 py-1.5"
                        radius="full"
                        size="sm"
                      >
                        Buy Now
                      </Button>
                    </Link>
                  )}
                </div>
              </Card.Footer>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
