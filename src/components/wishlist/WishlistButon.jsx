"use client";

import { useState } from "react";
import { Button, Tooltip } from "@heroui/react";
import { Heart } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { postWishlist } from "@/lib/actions/wishlist";

export default function WishlistButton({
  product,
  initialWishlisted = false,
  onToggle,
}) {
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [isLoading, setIsLoading] = useState(false);

  const { data } = useSession();
  const userInfo = data?.user?.email || null;

  const handlePress = async () => {
    if (!userInfo || isLoading || isWishlisted) {
      return;
    }

    try {
      setIsLoading(true);

      await postWishlist(product, userInfo);

      setIsWishlisted(true);
      onToggle?.(true);
    } catch (error) {
      console.error("Wishlist error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tooltip
      content={isWishlisted ? "Added to Wishlist" : "Add to Wishlist"}
      color="foreground"
      closeDelay={0}
    >
      <Button
        isIconOnly
        variant="light"
        isDisabled={isLoading}
        aria-label={
          isWishlisted ? "Added to Wishlist" : "Add to Wishlist"
        }
        onClick={handlePress}
        className={`group rounded-full transition-all duration-300 ${
          isWishlisted
            ? "hover:bg-red-100 dark:hover:bg-red-900/30"
            : "hover:bg-default-100 dark:hover:bg-default-50/10"
        } active:scale-90 focus-visible:ring-2 focus-visible:ring-red-500/50`}
      >
        <Heart
          className={`w-5 h-5 transition-all duration-300 ease-in-out ${
            isWishlisted
              ? "fill-red-500 text-red-500 scale-110"
              : "text-default-500 group-hover:text-red-400 group-hover:scale-110"
          }`}
        />
      </Button>
    </Tooltip>
  );
}