"use client";

import { Card, Button, Chip } from "@heroui/react";
import Image from "next/image";
import Link from "next/link";
import WishlistButton from "../wishlist/WishlistButon";

export default function ProductsCard({ products }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => {
        // প্রাইস কে safely number এ convert করা হচ্ছে
        const formattedPrice = product.price
          ? parseFloat(product.price).toFixed(2)
          : "0.00";

        const imageSrc =
          typeof product.image === "string" && product.image.trim().length > 0
            ? product.image.trim()
            : null;

        // image src safely resolve করা হচ্ছে (empty string / whitespace হ্যান্ডেল করার জন্য)
        // const imageSrc =
        //   product.image && product.image.trim() !== ""
        //     ? product.image.trim()
        //     : product.name;

        return (
          <Card
            key={product._id || product.id}
            className="border border-default-200 bg-content1 hover:shadow-lg transition-shadow"
          >
            {/* Semantic Link wrapping card header and content */}
            <Link
              href={`/products/${product._id || product.id}`}
              className="group block text-left focus:outline-none"
            >
              <Card.Header className="pb-0 pt-2 px-4 flex-col items-start">
                <div className="flex justify-between w-full items-center">
                  <Chip
                    color="primary"
                    variant="flat"
                    size="sm"
                    className="capitalize"
                  >
                    {product.category}
                  </Chip>
                  <p className="text-large font-bold text-emerald-700">
                    ${formattedPrice}
                  </p>
                </div>

                <Card.Title className="font-bold text-xl mt-3 text-default-800 group-hover:text-emerald-600 transition-colors line-clamp-1">
                  {product.name || product.title}
                </Card.Title>

                <Card.Description className="text-small text-default-500 mt-1 line-clamp-2">
                  {product.description}
                </Card.Description>
              </Card.Header>

              <Card.Content className="overflow-visible py-3 px-4">
                {imageSrc ? (
                  <div className="overflow-hidden rounded-xl">
                    <Image
                      src={imageSrc}
                      alt={product.title || "Product"}
                      width={300}
                      height={300}
                      className="w-full object-cover rounded-xl aspect-square transition-transform duration-300 group-hover:scale-105"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-square rounded-xl bg-default-100 flex items-center justify-center text-default-500">
                    No Image
                  </div>
                )}
              </Card.Content>
            </Link>

            <Card.Footer className="justify-end gap-2 pt-0 px-4 pb-4">
              <Link href={`/products/${product._id || product.id}`}>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs"
                  radius="full"
                  size="sm"
                >
                  Buy Now
                </Button>
              </Link>

              <WishlistButton product={product}></WishlistButton>
            </Card.Footer>
          </Card>
        );
      })}
    </div>
  );
}
