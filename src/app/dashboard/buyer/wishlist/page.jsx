"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Heart, ShoppingBag, Sparkles } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import WishlistCard from "@/components/wishlist/WishlistCard";
import { getWishlist, deleteWishlistItem } from "@/lib/actions/wishlist";

const WishlistPage = () => {
  const { data } = useSession();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const userInfo = data?.user?.email || null;

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!userInfo) {
        setLoading(false);
        return;
      }

      try {
        const result = await getWishlist(userInfo);
        setWishlist(result);
      } catch (error) {
        console.error("Failed to fetch wishlist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [userInfo]);

  const handleRemove = async (wishlistId) => {
    try {
      await deleteWishlistItem(wishlistId);
      setWishlist((prev) => prev.filter((item) => item._id !== wishlistId));
      toast.success("Item removed from wishlist");
    } catch (error) {
      console.error("Failed to remove wishlist item:", error);
      toast.error(error.message || "Failed to remove item");
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 w-44 bg-slate-200 rounded-md" />
        <div className="h-4 w-64 bg-slate-100 rounded-md" />
        <div className="h-28 bg-white border border-slate-200 rounded-2xl" />
        <div className="h-28 bg-white border border-slate-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/50 mb-2">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            Saved Items
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Wishlist
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Pre-owned items you have saved to track or purchase later.
          </p>
        </div>

        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition self-start sm:self-auto"
        >
          <ShoppingBag className="w-4 h-4 text-emerald-600" />
          Browse More Items
        </Link>
      </div>

      {wishlist.length === 0 ? (
        <div className="border border-dashed border-slate-300 rounded-3xl p-12 bg-white text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 mb-4">
            <Heart className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Your wishlist is empty
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 leading-relaxed">
            Click the heart icon on any listing to save items you are interested in and compare prices.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xs transition"
            >
              <ShoppingBag className="w-4 h-4" />
              Explore Marketplace
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {wishlist.map((item) => (
            <WishlistCard
              key={item._id}
              item={item}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;