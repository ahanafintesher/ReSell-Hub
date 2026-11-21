"use client";

import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "resellhub_cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize from localStorage on client asynchronously to avoid cascading renders
  useEffect(() => {
    let ignore = false;
    async function initCart() {
      try {
        await Promise.resolve();
        if (ignore) return;
        const stored = typeof window !== "undefined" ? localStorage.getItem(CART_STORAGE_KEY) : null;
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setItems(parsed);
          }
        }
      } catch (err) {
        console.warn("Failed to parse cart storage:", err);
      } finally {
        if (!ignore) {
          setIsLoaded(true);
        }
      }
    }
    initCart();
    return () => {
      ignore = true;
    };
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.warn("Failed to persist cart storage:", err);
    }
  }, [items, isLoaded]);

  const addToCart = (product, quantity = 1) => {
    if (!product || !product._id) {
      toast.error("Invalid product");
      return;
    }

    if (product.status === "sold") {
      toast.error("This item has been sold and cannot be added to cart");
      return;
    }

    const availableStock = product.stock !== undefined ? Number(product.stock) : 1;
    if (availableStock <= 0) {
      toast.error("Item is out of stock");
      return;
    }

    const existingIndex = items.findIndex((item) => item._id === product._id);
    if (existingIndex > -1) {
      const existing = items[existingIndex];
      const nextQty = existing.quantity + quantity;
      if (nextQty > availableStock) {
        toast.error(`Only ${availableStock} item(s) available in stock`);
        return;
      }
      const updated = [...items];
      updated[existingIndex] = { ...existing, quantity: nextQty };
      setItems(updated);
      toast.success(`Updated cart quantity (${nextQty})`);
    } else {
      const addQty = Math.min(quantity, availableStock);
      const newItem = {
        _id: product._id,
        title: product.title || "Product",
        price: Number(product.price) || 0,
        image: product.image || "/placeholder.png",
        category: product.category || "General",
        condition: product.condition || "Used",
        stock: availableStock,
        sellerInfo: product.sellerInfo || "",
        sellerName: product.sellerName || "Seller",
        quantity: addQty,
      };
      setItems([...items, newItem]);
      toast.success("Added to cart!");
    }
  };

  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((item) => item._id !== productId));
    toast.success("Removed item from cart");
  };

  const updateQuantity = (productId, newQty) => {
    const qty = parseInt(newQty, 10);
    if (isNaN(qty) || qty <= 0) {
      removeFromCart(productId);
      return;
    }

    const target = items.find((item) => item._id === productId);
    const maxStock = target?.stock !== undefined ? Number(target.stock) : 99;
    if (qty > maxStock) {
      toast.error(`Maximum available stock is ${maxStock}`);
    }
    const capped = Math.min(qty, maxStock);
    setItems((prev) =>
      prev.map((item) => (item._id === productId ? { ...item, quantity: capped } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartCount = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  const cartSubtotal = items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );
  const cartTotal = cartSubtotal; // Free delivery model

  return (
    <CartContext.Provider
      value={{
        items,
        isLoaded,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
