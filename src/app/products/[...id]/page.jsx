import { getSingleProduct } from "@/lib/actions/getSingleProduct";
import Image from "next/image";
import { Card, Button, Chip } from "@heroui/react";
import WishlistButton from "@/components/wishlist/WishlistButon";
import ReviewSection from "@/components/ReviewSection/ReviewSection";
import AvgRating from "@/components/ReviewSection/AvgRating";
import UserReviewSection from "@/components/ReviewSection/UserReviewSection";
import { ShieldCheck, User, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const Page = async ({ params, searchParams }) => {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const rawId = resolvedParams?.id;
  const productId = Array.isArray(rawId) ? rawId[0] : rawId;
  const errorMessage = resolvedSearchParams?.error;

  let data = null;
  try {
    if (productId) {
      data = await getSingleProduct(productId);
    }
  } catch (err) {
    console.error("Failed to load product:", err);
  }

  if (!data || !data._id || data.message) {
    return (
      <div className="max-w-4xl mx-auto px-5 py-20 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">Product Not Found</h1>
        <p className="text-gray-500 dark:text-slate-400 mb-6">
          The item you are looking for does not exist or may have been removed.
        </p>
        <Link href="/products">
          <Button color="primary" className="bg-emerald-600 text-white font-medium px-6 py-2">
            Browse All Products
          </Button>
        </Link>
      </div>
    );
  }

  const isSold = data.status === "sold";

  return (
    <div className="max-w-7xl mx-auto px-5 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
      </div>

      {/* Error alert from checkout if any */}
      {errorMessage && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>{decodeURIComponent(errorMessage)}</span>
        </div>
      )}

      <Card className="shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/90">
        <Card.Header className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-6 lg:p-10">
          {/* Product Image */}
          <div className="relative flex items-center justify-center bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl p-8 border border-slate-100 dark:border-slate-800">
            {isSold && (
              <div className="absolute top-4 left-4 z-10">
                <span className="inline-block bg-rose-600 text-white font-bold text-xs uppercase px-3 py-1.5 rounded-full shadow-md tracking-wider">
                  Sold Out
                </span>
              </div>
            )}
            <Image
              src={data.image || "/placeholder.png"}
              alt={data.title || "Product"}
              width={500}
              height={500}
              className={`object-contain max-h-[460px] rounded-xl transition-all ${
                isSold ? "opacity-75 grayscale-25" : ""
              }`}
              priority
            />
          </div>

          {/* Product Information */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Chip color="primary" variant="flat" className="capitalize font-medium">
                  {data.category}
                </Chip>
                {data.condition && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50 capitalize">
                    {data.condition}
                  </span>
                )}
                {data.stock !== undefined && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    Stock: {data.stock}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {data.title}
              </h1>

              <div className="pt-1">
                <AvgRating data={data} />
              </div>

              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base pt-2">
                {data.description}
              </p>
            </div>

            {/* Seller info box */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
                  {data.sellerName?.charAt(0)?.toUpperCase() || "S"}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white">
                    {data.sellerName || "Verified Community Seller"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Verified Seller · Buyer Protection Eligible
                  </p>
                </div>
              </div>
            </div>

            {/* Price section with transparent currency notice */}
            <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-baseline gap-3">
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Asking Price:
                </span>
                <span className="text-4xl font-extrabold text-emerald-700 dark:text-emerald-400">
                  ৳{data.price}
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Marketplace listed in BDT (৳). Card checkout is securely processed in USD ($ {data.price}) via Stripe.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-4 flex-wrap pt-2">
              {isSold ? (
                <div className="w-full sm:w-auto">
                  <Button
                    disabled
                    className="bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold px-8 py-3 cursor-not-allowed text-base"
                    size="lg"
                  >
                    Item Sold Out
                  </Button>
                  <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-medium">
                    This item has been purchased and is no longer available.
                  </p>
                </div>
              ) : (
                <form action="/api/payments" method="POST">
                  <input type="hidden" name="productId" value={data._id} />
                  <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold px-8 py-3 shadow-md transition-all text-base"
                    size="lg"
                  >
                    Buy Now
                  </Button>
                </form>
              )}

              <WishlistButton product={data} />
            </div>
          </div>
        </Card.Header>
      </Card>

      <ReviewSection data={data} />
      <UserReviewSection data={data} />
    </div>
  );
};

export default Page;
