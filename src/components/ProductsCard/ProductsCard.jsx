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
            {/* button-এর বদলে HeroUI Button ব্যবহার করা হলো */}
            <Button
              variant="light"
              onPress={() =>
                console.log(`View product ${product._id || product.id}`)
              }
              className="w-full h-auto p-0 justify-start text-left bg-transparent shadow-none flex-col items-stretch"
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
                  <p className="text-large font-bold text-primary">
                    ${formattedPrice}
                  </p>
                </div>

                <Card.Title className="font-bold text-xl mt-3 text-default-800 line-clamp-1">
                  {product.name || product.title}
                </Card.Title>

                <Card.Description className="text-small text-default-500 mt-1 line-clamp-2">
                  {product.description}
                </Card.Description>
              </Card.Header>

              {/* v3-এ Card.Body এর জায়গায় Card.Content */}
              <Card.Content className="overflow-visible py-3 px-4">
                {imageSrc ? (
                  <Image
                    src={imageSrc}
                    alt={product.title || "Product"}
                    width={300}
                    height={300}
                    className="w-full object-cover rounded-xl aspect-square"
                    unoptimized
                  />
                ) : (
                  <div className="w-full aspect-square rounded-xl bg-default-100 flex items-center justify-center text-default-500">
                    No Image
                  </div>
                )}
              </Card.Content>
            </Button>

            <Card.Footer className="justify-end gap-2">
              <Link href={`/products/${product._id}`}>
                <Button className={"bg-green-400"} radius="full" size="sm">
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
