"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Package,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "@heroui/react";

export default function CartPage() {
  const {
    items,
    isLoaded,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartCount,
    cartSubtotal,
    cartTotal,
  } = useCart();

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-28 bg-slate-100 dark:bg-slate-800/60 rounded-2xl animate-pulse" />
            <div className="h-28 bg-slate-100 dark:bg-slate-800/60 rounded-2xl animate-pulse" />
          </div>
          <div className="h-64 bg-slate-100 dark:bg-slate-800/60 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50 shadow-xs">
          <ShoppingCart className="h-12 w-12" />
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Your Cart is Empty
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base text-slate-500 dark:text-slate-400">
          Looks like you haven&apos;t added any items yet. Explore the marketplace to find quality pre-owned products at great prices.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link href="/products">
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 shadow-md"
              size="lg"
            >
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 transition-colors">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Shopping Cart
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            You have {cartCount} item{cartCount > 1 ? "s" : ""} in your shopping cart.
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline self-start sm:self-auto cursor-pointer"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items list */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const maxStock = item.stock !== undefined ? Number(item.stock) : 99;
            const lineTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);

            return (
              <div
                key={item._id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs transition hover:border-slate-300 dark:hover:border-slate-700"
              >
                {/* Product image and title */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <Image
                      src={item.image || "/placeholder.png"}
                      alt={item.title}
                      fill
                      className="object-contain p-2"
                      sizes="80px"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${item._id}`}
                      className="font-semibold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 truncate block text-base"
                    >
                      {item.title}
                    </Link>

                    <div className="mt-1 flex items-center gap-2 flex-wrap text-xs text-slate-500 dark:text-slate-400">
                      <span className="capitalize">{item.category}</span>
                      <span>•</span>
                      <span className="capitalize">{item.condition}</span>
                      {item.sellerName && (
                        <>
                          <span>•</span>
                          <span>Seller: {item.sellerName}</span>
                        </>
                      )}
                    </div>

                    <p className="mt-1 text-sm font-bold text-emerald-700 dark:text-emerald-400 sm:hidden">
                      ৳{Number(item.price).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Price, Quantity, Subtotal, Delete */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="hidden sm:block text-right">
                    <p className="text-xs text-slate-400 dark:text-slate-500">Unit Price</p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      ৳{Number(item.price).toLocaleString()}
                    </p>
                  </div>

                  {/* Quantity selector */}
                  <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-slate-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      disabled={item.quantity >= maxStock}
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Total for item */}
                  <div className="text-right min-w-[80px]">
                    <p className="text-xs text-slate-400 dark:text-slate-500 sm:block hidden">Total</p>
                    <p className="font-bold text-slate-900 dark:text-emerald-400">
                      ৳{lineTotal.toLocaleString()}
                    </p>
                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    aria-label={`Remove ${item.title} from cart`}
                    onClick={() => removeFromCart(item._id)}
                    className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}

          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary sidebar */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm sticky top-20">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 border-b border-slate-100 dark:border-slate-800 pb-4 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal ({cartCount} item{cartCount > 1 ? "s" : ""})</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  ৳{cartSubtotal.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Estimated Delivery</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Free
                </span>
              </div>
            </div>

            <div className="pt-4 mb-6">
              <div className="flex justify-between items-baseline">
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  Estimated Total
                </span>
                <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
                  ৳{cartTotal.toLocaleString()}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Card checkout is converted to USD ($ {cartTotal}) at standard bank rates.
              </p>
            </div>

            <Link href="/checkout" className="block w-full">
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-base shadow-md transition"
                size="lg"
                endContent={<ArrowRight className="h-4 w-4" />}
              >
                Proceed to Checkout
              </Button>
            </Link>

            <div className="mt-6 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Buyer Protection Guarantee on all marketplace transactions.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
