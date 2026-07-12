"use client";
import { authClient, useSession } from "@/lib/auth-client";
import { useState } from "react";
import { Button, Tooltip } from "@heroui/react";
import { Heart } from "lucide-react";
import { postWishlist } from "@/lib/actions/postWishlist";

export default function WishlistButton({ 
    product,
    initialWishlisted = false, 
  onToggle 
}) 



{
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
    const { data, error } = useSession();
    const userInfo = data?.user?.email || null;
  const handlePress = () => {
    const newState = !isWishlisted;
    setIsWishlisted(newState);
    // Parent component এ state পাঠানোর জন্য
    onToggle?.(newState);
    postWishlist(product, userInfo); 
  };

  return (
    <Tooltip 
      content={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"} 
      color="foreground"
      closeDelay={0}
    >
      <Button
        isIconOnly
        variant="light"
        aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        onClick={handlePress}
        className={`group rounded-full transition-all duration-300 
          ${isWishlisted 
            ? "hover:bg-red-100 dark:hover:bg-red-900/30" 
            : "hover:bg-default-100 dark:hover:bg-default-50/10"
          } 
          active:scale-90 focus-visible:ring-2 focus-visible:ring-red-500/50`}
      >
        <Heart
          className={`w-5 h-5 transition-all duration-300 ease-in-out 
            ${
              isWishlisted
                ? "fill-red-500 text-red-500 scale-110 drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]"
                : "text-default-500 group-hover:text-red-400 group-hover:scale-110"
            }`}
        />
      </Button>
    </Tooltip>
  );
}