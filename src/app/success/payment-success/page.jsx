import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ShoppingBag, Home } from "lucide-react";
import { getSingleProduct } from "@/lib/actions/getSingleProduct";


import { stripe } from "@/lib/stripe";
import { postPaymentHistory } from "@/lib/actions/paymentHistory";
import { postOrder } from "@/lib/actions/orders";

export default async function Success({ searchParams }) {
  const { session_id } = await searchParams;

  if (!session_id)
    throw new Error("Please provide a valid session_id (`cs_test_...`)");

  const {
    status,
    metadata,
    customer_details: { email: customerEmail },
  } = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ["line_items", "payment_intent"],
  });

  if (status === "open") {
    return redirect("/");
  }

  if (status === "complete") {
    try {
      await postPaymentHistory(metadata, session_id, new Date().toISOString());
      const product = await getSingleProduct(metadata?.productId);
      const sellerInfo = product?.sellerInfo || "not found";
      const sellerName = product?.sellerName || "N/A";

      const orderData = {
        paymentId: session_id,
        productId: metadata?.productId,
        productTitle: metadata?.title,
        price: Number(metadata?.price || 0),
        sellerName,
        sellerInfo: sellerInfo,
        buyerName: metadata?.buyerName,
        buyerInfo: metadata?.userEmail,
        paymentStatus: "paid",
        orderStatus: "pending",
      };

      await postOrder(orderData);
    } catch (postErr) {
      // If already recorded via webhook or session unavailable, log and proceed
      console.warn("Payment success recording note:", postErr.message);
    }

    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4 py-10">
        <div className="w-full max-w-xl rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-14 w-14 text-green-600" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-3 text-center">
            <h1 className="text-4xl font-bold text-gray-900">
              Payment Successful!
            </h1>

            <p className="text-gray-600">
              Thank you for your purchase. Your payment has been processed
              successfully.
            </p>
          </div>

          {/* Email Card */}
          <div className="mt-8 rounded-2xl border bg-gray-50 p-5">
            <p className="text-sm text-gray-500">
              Confirmation Email Sent To
            </p>

            <p className="mt-1 break-all text-lg font-semibold text-gray-900">
              {customerEmail}
            </p>
          </div>

          {/* Info */}
          <div className="mt-6 rounded-2xl border border-green-100 bg-green-50 p-5">
            <p className="text-sm leading-7 text-green-700">
              We appreciate your business! A confirmation email has been sent to
              your inbox. If you have any questions, please contact{" "}
              <a
                href="mailto:orders@example.com"
                className="font-semibold underline"
              >
                orders@example.com
              </a>
              .
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 font-medium text-white transition hover:bg-gray-800 text-sm"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>

            <Link
              href="/dashboard/buyer/orders"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-100 text-sm"
            >
              <ShoppingBag className="h-4 w-4" />
              My Orders
            </Link>

            <Link
              href="/products"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-medium text-white transition hover:bg-green-700 text-sm"
            >
              Continue Shopping
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-8 border-t pt-6 text-center text-sm text-gray-500">
            Transaction ID
            <div className="mt-2 break-all rounded-lg bg-gray-100 px-3 py-2 font-mono text-xs text-gray-700">
              {session_id}
            </div>
          </div>
        </div>
      </main>
    );
  }
}