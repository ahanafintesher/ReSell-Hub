"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function AddToCartButton({ product, className = "" }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (!product || product.status === "sold") return;
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const isSold = product?.status === "sold";

  return (
    <Button
      type="button"
      onPress={handleAdd}
      isDisabled={isSold}
      variant="flat"
      color={added ? "success" : "default"}
      size="lg"
      className={`font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition ${className}`}
      startContent={
        added ? (
          <Check className="h-4 w-4 text-emerald-600" />
        ) : (
          <ShoppingCart className="h-4 w-4" />
        )
      }
    >
      {added ? "Added to Cart" : "Add to Cart"}
    </Button>
  );
}
