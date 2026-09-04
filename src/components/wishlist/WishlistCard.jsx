"use client";

import React from "react";
import { Heart } from "lucide-react";

const WishlistCard = ({ item, onRemove }) => {
  const product = item.product || item;

  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex gap-4">
          {/* <img
            src={product.image}
            alt={product.title}
            className="w-24 h-24 rounded-lg object-cover border border-gray-100"
          /> */}

          <div>
            <h3 className="font-medium text-gray-900">
              {product.title}
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Category: {product.category || "N/A"}
            </p>

            <p className="text-sm text-gray-500 mt-1">
              Added on{" "}
              {item.createdAt
                ? new Date(item.createdAt).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onRemove?.(item._id)}
          className="p-2 rounded-full text-red-500 hover:bg-red-50 transition"
          aria-label="Remove from wishlist"
        >
          <Heart className="w-5 h-5 fill-red-500" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Price</span>
          <p className="font-medium text-gray-900">
            ৳{product.price ?? "N/A"}
          </p>
        </div>

        <div>
          <span className="text-gray-500">Stock</span>
          <p>{product.stock ?? "N/A"}</p>
        </div>

        <div>
          <span className="text-gray-500">Condition</span>
          <p>{product.condition || "N/A"}</p>
        </div>

        <div>
          <span className="text-gray-500">Seller</span>
          <p>{product.sellerInfo || "N/A"}</p>
        </div>
      </div>

      {product.description && (
        <p className="mt-4 text-sm text-gray-600 line-clamp-2">
          {product.description}
        </p>
      )}
    </div>
  );
};

export default WishlistCard;