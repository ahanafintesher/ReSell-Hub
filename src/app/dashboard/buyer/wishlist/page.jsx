"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import WishlistCard from "@/components/wishlist/WishlistCard";
import { getWishlist } from "@/lib/actions/wishlist";
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
      const res = await fetch(`/api/wishlist/${wishlistId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to remove wishlist item");
      }

      setWishlist((prev) =>
        prev.filter((item) => item._id !== wishlistId)
      );
    } catch (error) {
      console.error("Failed to remove wishlist item:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-5">
        <h1 className="text-2xl font-semibold text-gray-900">
          My Wishlist
        </h1>

        <p className="mt-4 text-gray-500">
          Loading wishlist...
        </p>
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          My Wishlist
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Products you have added to your wishlist.
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="border border-gray-200 rounded-xl p-10 bg-white shadow-sm text-center">
          <h2 className="text-lg font-medium text-gray-900">
            Your wishlist is empty
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            You haven't added any products to your wishlist yet.
          </p>
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