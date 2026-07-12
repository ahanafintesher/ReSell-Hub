"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input, Select, Label, ListBox, Button } from "@heroui/react";
import ProductsCard from "./ProductsCard";

export default function ProductsFilters({
  products,
  currentSearch,
  currentCategory,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // URL update করার function
  const updateFilters = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== "all" && value !== "") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  // Search handler (debounced)
  let searchTimeout;
  const handleSearchChange = (e) => {
    const value = e.target.value;
    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {
      updateFilters("search", value);
    }, 400); // 400ms debounce
  };

  // Category handler
  const handleCategoryChange = (keys) => {
    console.log(keys, "selected category keys");
    const selected = Array.from(keys)[0] || "all";
    updateFilters("category", selected);
  };

  // Reset handler
  const handleReset = () => {
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasActiveFilters = currentSearch !== "" || currentCategory !== "all";

  return (
    <div>
      {/* Filters Section */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-end">
        {/* Search Input */}
        <div className="flex-1 w-full sm:max-w-sm">
          <Input
            type="search"
            aria-label="Search Products"
            placeholder="Search by name or description..."
            defaultValue={currentSearch}
            onChange={handleSearchChange}
            className="w-full"
            disabled={isPending} // 👈 এখানে isDisabled থেকে disabled করা হয়েছে
          />
        </div>

        {/* Category Filter */}
        <div className="w-full sm:w-56">
          <Select
            aria-label="Category"
            className="w-full"
            placeholder="All Categories"
            selectedKeys={currentCategory === "all" ? [] : [currentCategory]}
            onSelectionChange={handleCategoryChange}
            disabled={isPending} // 👈 এখানে isDisabled থেকে disabled করা হয়েছে
          >
            <Label>Category</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="all" textValue="All Categories">
                  All Categories
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="Audio" textValue="Audio">
                  Audio
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="Wearables" textValue="Wearables">
                  Wearables
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="Accessories" textValue="Accessories">
                  Accessories
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="Electronics" textValue="Electronics">
                  Electronics
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="Others" textValue="Others">
                  Others
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        </div>

        {/* Reset Button */}
        <Button
          onPress={handleReset}
          disabled={!hasActiveFilters || isPending} // 👈 এখানে isDisabled থেকে disabled করা হয়েছে
          className="h-14 px-6"
        >
          Reset
        </Button>
      </div>

      {/* Loading indicator */}
      {isPending && (
        <div className="mb-4 flex items-center gap-2 text-default-500">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">Loading...</span>
        </div>
      )}

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-default-500">
          Showing{" "}
          <span className="font-semibold text-default-900">
            {products.length}
          </span>{" "}
          products
          {hasActiveFilters && " (filtered)"}
        </p>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <ProductsCard products={products} />
      ) : (
        <div className="text-center py-20">
          <p className="text-xl text-default-500 mb-4">
            No products found matching your criteria.
          </p>
          <Button onPress={handleReset} className="px-6">
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
