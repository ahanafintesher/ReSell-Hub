"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Lock,
  ShieldCheck,
  Truck,
  CreditCard,
  AlertCircle,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@heroui/react";
import { useSession } from "@/lib/auth-client";
import { useCart } from "@/context/CartContext";
import { getSingleProduct } from "@/lib/actions/getSingleProduct";
import toast from "react-hot-toast";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending: sessionLoading } = useSession();
  const { items: cartItems, isLoaded: cartLoaded, clearCart } = useCart();

  const directProductId = searchParams.get("productId");
  const queryQuantity = Math.max(1, parseInt(searchParams.get("quantity"), 10) || 1);
  const queryError = searchParams.get("error");
  const wasCancelled = searchParams.get("cancelled") === "true";

  // State for direct product (if checking out directly)
  const [directProduct, setDirectProduct] = useState(null);
  const [productLoading, setProductLoading] = useState(Boolean(directProductId));
  const [productError, setProductError] = useState(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [notes, setNotes] = useState("");

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Populate user data from session asynchronously
  useEffect(() => {
    let ignore = false;
    async function initUser() {
      await Promise.resolve();
      if (!ignore && session?.user) {
        setFullName((prev) => prev || session.user.name || "");
        setEmail((prev) => prev || session.user.email || "");
      }
    }
    initUser();
    return () => {
      ignore = true;
    };
  }, [session]);

  // Fetch direct product if productId param is present
  useEffect(() => {
    let isMounted = true;
    async function fetchDirectProduct() {
      if (!directProductId) {
        return;
      }

      try {
        const data = await getSingleProduct(directProductId);
        if (isMounted) {
          if (data && data._id) {
            setDirectProduct(data);
          } else {
            setProductError("Product not found or unavailable.");
          }
        }
      } catch (err) {
        if (isMounted) {
          console.warn("Direct product fetch notice:", err.message);
          // Fallback: search for item in cart
          const found = cartItems.find((i) => i._id === directProductId);
          if (found) {
            setDirectProduct(found);
          } else {
            setProductError("Unable to load product information.");
          }
        }
      } finally {
        if (isMounted) {
          setProductLoading(false);
        }
      }
    }

    fetchDirectProduct();
    return () => {
      isMounted = false;
    };
  }, [directProductId, cartItems]);

  // Compute checkout items list
  const checkoutItems = useMemo(() => {
    if (directProduct) {
      return [
        {
          _id: directProduct._id,
          title: directProduct.title,
          price: Number(directProduct.price) || 0,
          image: directProduct.image || "/placeholder.png",
          category: directProduct.category,
          condition: directProduct.condition,
          sellerName: directProduct.sellerName || "Verified Seller",
          quantity: queryQuantity,
        },
      ];
    }
    return cartItems;
  }, [directProduct, queryQuantity, cartItems]);

  const subtotal = useMemo(() => {
    return checkoutItems.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );
  }, [checkoutItems]);

  const deliveryFee = 0; // Free delivery
  const totalAmount = subtotal + deliveryFee;

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!fullName.trim()) errors.fullName = "Full name is required";
    if (!email.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Please enter a valid email address";
    }
    if (!phone.trim()) {
      errors.phone = "Phone number is required for delivery contact";
    }
    if (!address.trim()) {
      errors.address = "Street / delivery address is required";
    }
    if (!city.trim()) {
      errors.city = "City or region is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToPayment = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!session?.user) {
      toast.error("Please log in to complete your checkout");
      const redirectPath = directProductId
        ? `/checkout?productId=${directProductId}`
        : "/checkout";
      router.push(`/auth/login?redirect=${encodeURIComponent(redirectPath)}`);
      return;
    }

    if (checkoutItems.length === 0) {
      toast.error("No items selected for checkout");
      return;
    }

    if (!validateForm()) {
      toast.error("Please fill in all required delivery fields");
      return;
    }

    try {
      setIsSubmitting(true);

      const targetItem = checkoutItems[0];
      const payload = {
        productId: targetItem._id,
        quantity: targetItem.quantity || 1,
        buyerName: fullName.trim(),
        buyerPhone: phone.trim(),
        shippingAddress: `${address.trim()}, ${city.trim()}${postalCode ? ` ${postalCode.trim()}` : ""}`,
        notes: notes.trim(),
      };

      const res = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to initialize payment session");
      }

      if (data.url) {
        // Clear cart if checking out cart items
        if (!directProduct) {
          clearCart();
        }
        window.location.href = data.url;
      } else {
        throw new Error("No payment checkout URL returned by server");
      }
    } catch (err) {
      console.error("Checkout submission error:", err);
      toast.error(err.message || "Payment initiation failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (sessionLoading || productLoading || (!directProductId && !cartLoaded)) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <div className="flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Preparing your checkout...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in prompt
  if (!session?.user) {
    const redirectUrl = directProductId
      ? `/checkout?productId=${directProductId}`
      : "/checkout";

    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
          <Lock className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Sign In to Complete Checkout
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          You need an active ReSell Hub account to securely process purchases and receive tracking updates.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href={`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`}>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2">
              Log In to Continue
            </Button>
          </Link>
          <Link href={`/auth/register?redirect=${encodeURIComponent(redirectUrl)}`}>
            <Button variant="flat" color="default" className="px-6 py-2">
              Register
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Empty checkout state
  if (checkoutItems.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
          <ShoppingCart className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          No Products to Checkout
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Your checkout bag is currently empty. Please select a product from the marketplace.
        </p>
        <div className="mt-6">
          <Link href="/products">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2">
              Browse Marketplace
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 transition-colors">
      {/* Header and Back Link */}
      <div className="mb-6">
        <Link
          href={directProductId ? `/products/${directProductId}` : "/cart"}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          {directProductId ? "Back to Product" : "Back to Cart"}
        </Link>
        <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Secure Checkout
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Verify your order details and specify your delivery address before proceeding to Stripe payment.
        </p>
      </div>

      {/* Cancelled or Error Notice */}
      {wasCancelled && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 p-4 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
          <span>Payment was cancelled on Stripe. Your items remain preserved in your checkout.</span>
        </div>
      )}

      {queryError && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 p-4 border border-rose-200 dark:border-rose-800/50 text-rose-800 dark:text-rose-300 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
          <span>{decodeURIComponent(queryError)}</span>
        </div>
      )}

      <form onSubmit={handleProceedToPayment}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Delivery Information Form (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Delivery Information
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Where should the seller ship your items?
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="e.g. Nusrat Jahan"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={`w-full rounded-xl border bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                        formErrors.fullName ? "border-rose-500 focus:ring-rose-500" : "border-slate-300 dark:border-slate-700 focus:ring-emerald-500"
                      }`}
                    />
                    {formErrors.fullName && (
                      <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{formErrors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="e.g. buyer@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full rounded-xl border bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                        formErrors.email ? "border-rose-500 focus:ring-rose-500" : "border-slate-300 dark:border-slate-700 focus:ring-emerald-500"
                      }`}
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{formErrors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number (for courier delivery) *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="e.g. +880 1712 345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full rounded-xl border bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                      formErrors.phone ? "border-rose-500 focus:ring-rose-500" : "border-slate-300 dark:border-slate-700 focus:ring-emerald-500"
                    }`}
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{formErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Street Address / Apartment / House *
                  </label>
                  <input
                    type="text"
                    name="address"
                    placeholder="e.g. House 42, Road 11, Block D, Banani"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={`w-full rounded-xl border bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                      formErrors.address ? "border-rose-500 focus:ring-rose-500" : "border-slate-300 dark:border-slate-700 focus:ring-emerald-500"
                    }`}
                  />
                  {formErrors.address && (
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{formErrors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      City / District *
                    </label>
                    <input
                      type="text"
                      name="city"
                      placeholder="e.g. Dhaka"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={`w-full rounded-xl border bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                        formErrors.city ? "border-rose-500 focus:ring-rose-500" : "border-slate-300 dark:border-slate-700 focus:ring-emerald-500"
                      }`}
                    />
                    {formErrors.city && (
                      <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{formErrors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Postal Code (optional)
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      placeholder="e.g. 1213"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Delivery Notes / Instructions (optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Special delivery notes for the courier or seller..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment Guarantee Notice */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-5 flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                  Stripe Authoritative Escrow & Payment Protection
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Your payment is processed through Stripe 256-bit SSL encrypted checkout. Funds are protected under ReSell Hub Buyer Protection until delivery is confirmed.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Pay Action (5 cols) */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm sticky top-20 space-y-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                Order Summary
              </h2>

              {/* Items List */}
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {checkoutItems.map((item) => (
                  <div key={item._id} className="flex items-center gap-3 text-sm">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                      <Image
                        src={item.image || "/placeholder.png"}
                        alt={item.title}
                        fill
                        className="object-contain p-1"
                        sizes="56px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        Qty: {item.quantity} × ৳{Number(item.price).toLocaleString()}
                      </p>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-emerald-400 shrink-0">
                      ৳{(Number(item.price) * Number(item.quantity)).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    ৳{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Shipping & Handling</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Free
                  </span>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between items-baseline">
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    Total Amount
                  </span>
                  <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
                    ৳{totalAmount.toLocaleString()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-1">
                  Currency notice: Converted to USD ($ {totalAmount}) for international Stripe card processing.
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-3 text-base shadow-md transition disabled:opacity-60 cursor-pointer"
                  size="lg"
                  startContent={isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-4 w-4" />}
                >
                  {isSubmitting ? "Redirecting to Stripe..." : `Proceed to Payment (৳${totalAmount.toLocaleString()})`}
                </Button>

                <Link
                  href={directProductId ? `/products/${directProductId}` : "/cart"}
                  className="block text-center text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition py-1"
                >
                  Cancel Checkout
                </Link>
              </div>

              <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Verified Authoritative Database Pricing</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-20 text-center">
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Loading checkout...
            </p>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
