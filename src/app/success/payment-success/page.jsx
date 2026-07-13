import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ShoppingBag, Home } from "lucide-react";

import { stripe } from "@/lib/stripe";
import { postPaymentHistory } from "@/lib/actions/postPaymentHistory";

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
    await postPaymentHistory(metadata, session_id, new Date().toISOString());

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
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 font-medium text-white transition hover:bg-gray-800"
            >
              <Home className="h-5 w-5" />
              Back to Home
            </Link>

            <Link
              href="/orders"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 px-6 py-3 font-medium transition hover:bg-gray-100"
            >
              <ShoppingBag className="h-5 w-5" />
              View Orders
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