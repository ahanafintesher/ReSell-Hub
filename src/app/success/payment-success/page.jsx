import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  ShoppingBag,
  Home,
  Package,
  Calendar,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { getSingleProduct } from "@/lib/actions/getSingleProduct";
import { stripe } from "@/lib/stripe";
import { postPaymentHistory } from "@/lib/actions/paymentHistory";
import { postOrder } from "@/lib/actions/orders";

export default async function Success({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const session_id = resolvedSearchParams?.session_id;

  if (!session_id) {
    redirect("/dashboard/buyer/orders");
  }

  const session = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ["line_items", "payment_intent"],
  });

  if (session.status === "open") {
    return redirect("/");
  }

  const {
    status,
    metadata,
    customer_details,
    amount_total,
    currency,
    created,
  } = session;

  const customerEmail = customer_details?.email || metadata?.userEmail || "Customer";
  const paymentDate = created
    ? new Date(created * 1000).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : new Date().toLocaleString();

  let product = null;
  if (metadata?.productId) {
    try {
      product = await getSingleProduct(metadata.productId);
    } catch (err) {
      console.warn("Product lookup note on success page:", err.message);
    }
  }

  // Ensure record is saved if not already processed via webhook
  if (status === "complete") {
    try {
      await postPaymentHistory(metadata, session_id, new Date().toISOString());

      const sellerInfo = product?.sellerInfo || metadata?.sellerInfo || "Seller";
      const sellerName = product?.sellerName || metadata?.sellerName || "Seller";

      const orderData = {
        paymentId: session_id,
        productId: metadata?.productId,
        productTitle: metadata?.title || product?.title || "Marketplace Product",
        price: Number(metadata?.price || (amount_total ? amount_total / 100 : 0)),
        quantity: Number(metadata?.quantity || 1),
        sellerName,
        sellerInfo,
        buyerName: metadata?.buyerName || customer_details?.name || "Buyer",
        buyerInfo: metadata?.userEmail || customerEmail,
        buyerPhone: metadata?.buyerPhone || "",
        shippingAddress: metadata?.shippingAddress || "",
        paymentStatus: "paid",
        orderStatus: "pending",
      };

      await postOrder(orderData);
    } catch (postErr) {
      console.warn("Payment success recording note:", postErr.message);
    }
  }

  const displayPrice = Number(
    metadata?.price || (amount_total ? amount_total / 100 : 0)
  );
  const displayQuantity = Number(metadata?.quantity || 1);
  const displayTotal = displayPrice * displayQuantity;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50/60 via-white to-slate-50 dark:from-slate-950 dark:via-[#0b0f19] dark:to-slate-900 px-4 py-12 transition-colors">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-2xl">
        {/* Success Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-sm animate-in zoom-in-50">
            <CheckCircle2 className="h-12 w-12" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Payment Succeeded & Verified
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Thank You for Your Order!
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Your payment has been authorized and securely recorded. A confirmation receipt has been dispatched to{" "}
            <strong className="text-slate-800 dark:text-slate-200">{customerEmail}</strong>.
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Purchased Item Summary
            </h2>
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 capitalize">
              Order Status: Pending Dispatch
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <Image
                src={product?.image || "/placeholder.png"}
                alt={product?.title || metadata?.title || "Product"}
                fill
                className="object-contain p-1"
                sizes="80px"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-slate-900 dark:text-white text-base truncate">
                {product?.title || metadata?.title || "Marketplace Product"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Seller: {product?.sellerName || metadata?.sellerName || "Verified Community Seller"}
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                <span>Qty: <strong className="font-semibold text-slate-900 dark:text-white">{displayQuantity}</strong></span>
                <span>•</span>
                <span>Unit Price: <strong>৳{displayPrice.toLocaleString()}</strong></span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <p className="text-xs text-slate-400 dark:text-slate-500">Total Paid</p>
              <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400">
                ৳{displayTotal.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Transaction Metadata Grid */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 flex items-center gap-3">
            <Calendar className="h-5 w-5 text-slate-400 shrink-0" />
            <div>
              <p className="text-slate-400 uppercase font-medium">Payment Date</p>
              <p className="font-semibold text-slate-900 dark:text-slate-200 mt-0.5">
                {paymentDate}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-slate-400 shrink-0" />
            <div>
              <p className="text-slate-400 uppercase font-medium">Payment Gateway</p>
              <p className="font-semibold text-slate-900 dark:text-slate-200 mt-0.5">
                Stripe Card ({String(currency || "usd").toUpperCase()})
              </p>
            </div>
          </div>
        </div>

        {/* Delivery Destination (if provided) */}
        {metadata?.shippingAddress && (
          <div className="mt-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-xs">
            <p className="text-slate-400 uppercase font-medium">Delivery Address</p>
            <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
              {metadata.shippingAddress}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard/buyer/orders"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 px-4 py-3 font-semibold text-white transition text-sm shadow-md"
          >
            <FileText className="h-4 w-4" />
            View Order Details
          </Link>

          <Link
            href="/dashboard/buyer/orders"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-700 text-sm"
          >
            <ShoppingBag className="h-4 w-4" />
            Go to My Orders
          </Link>

          <Link
            href="/products"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-3 font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-800 text-sm"
          >
            <Home className="h-4 w-4" />
            Continue Shopping
          </Link>
        </div>

        {/* Transaction ID Footer */}
        <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-5 text-center text-xs text-slate-400 dark:text-slate-500">
          Stripe Checkout Session Reference
          <div className="mt-1.5 break-all rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2 font-mono text-[11px] text-slate-700 dark:text-slate-300">
            {session_id}
          </div>
        </div>
      </div>
    </main>
  );
}
