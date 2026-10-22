"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Search,
  Trash2,
  ExternalLink,
  Tag,
  DollarSign,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Store,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@heroui/react";
import toast from "react-hot-toast";
import { getProducts } from "@/lib/actions/getProducts";
import { deleteProducts, editProducts } from "@/lib/actions/product";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // In-flight mutations
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState(null);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error("Failed to load products:", err);
      setError(err.message || "Failed to load product catalog.");
      toast.error(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await loadProducts();
  };

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const data = await getProducts();
        if (!ignore) {
          setProducts(Array.isArray(data) ? data : []);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Failed to load product catalog.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, []);

  const handleDeleteProduct = async () => {
    if (!deleteConfirmProduct) return;
    const productId = deleteConfirmProduct._id;

    try {
      setActionLoadingId(productId);
      await deleteProducts(productId);

      setProducts((prev) => prev.filter((p) => p._id !== productId));
      toast.success("Product removed from marketplace successfully");
      setDeleteConfirmProduct(null);
    } catch (err) {
      console.error("Delete product error:", err);
      toast.error(err.message || "Failed to delete product");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleStatus = async (product) => {
    const currentStatus = product.status || "available";
    const nextStatus = currentStatus === "available" ? "hidden" : "available";

    try {
      setActionLoadingId(product._id);
      await editProducts(product._id, { status: nextStatus });

      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, status: nextStatus } : p))
      );

      toast.success(
        `Product marked as ${nextStatus === "hidden" ? "Hidden from buyers" : "Available"}`
      );
    } catch (err) {
      console.error("Status toggle error:", err);
      toast.error(err.message || "Failed to update product status");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Unique categories in catalog
  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        product.title?.toLowerCase().includes(q) ||
        product.sellerInfo?.toLowerCase().includes(q) ||
        product.sellerName?.toLowerCase().includes(q) ||
        product.category?.toLowerCase().includes(q);

      const matchesCategory =
        categoryFilter === "all" ||
        product.category?.toLowerCase() === categoryFilter.toLowerCase();

      const matchesCondition =
        conditionFilter === "all" ||
        product.condition?.toLowerCase() === conditionFilter.toLowerCase();

      const prodStatus = product.status || "available";
      const matchesStatus =
        statusFilter === "all" || prodStatus.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesCategory && matchesCondition && matchesStatus;
    });
  }, [products, searchQuery, categoryFilter, conditionFilter, statusFilter]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = products.length;
    const totalValue = products.reduce((acc, p) => acc + (Number(p.price) || 0), 0);
    const available = products.filter((p) => (p.status || "available") === "available").length;
    const uniqueCategories = categories.length;
    return { total, totalValue, available, uniqueCategories };
  }, [products, categories]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Manage Products</h1>
          <p className="mt-1 text-sm text-gray-500">
            Moderate marketplace listings, inspect seller ownership, manage visibility, and remove infringing products.
          </p>
        </div>

        <Button
          color="default"
          variant="flat"
          startContent={<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />}
          onPress={handleRefresh}
          isDisabled={loading}
          className="self-start sm:self-auto"
        >
          Refresh
        </Button>
      </div>

      {/* Aggregate Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Total Listings</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-green-600">Active / Available</p>
          <p className="mt-1 text-2xl font-bold text-green-700">{stats.available}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-blue-600">Catalog Value</p>
          <p className="mt-1 text-2xl font-bold text-blue-700">৳{stats.totalValue.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-purple-600">Categories</p>
          <p className="mt-1 text-2xl font-bold text-purple-700">{stats.uniqueCategories}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
          {/* Search */}
          <div className="relative sm:col-span-5">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, seller email, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
            />
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Condition Filter */}
          <div className="sm:col-span-2">
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
            >
              <option value="all">All Conditions</option>
              <option value="used">Used</option>
              <option value="like new">Like New</option>
              <option value="refurbished">Refurbished</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="hidden">Hidden</option>
              <option value="sold">Sold</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-5 w-5 text-red-600 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Unable to load product catalog</p>
            <p className="mt-0.5 text-xs text-red-700">{error}</p>
          </div>
          <Button size="sm" color="danger" variant="flat" onPress={loadProducts}>
            Retry
          </Button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
          <p className="mt-3 text-sm font-medium text-gray-700">Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
          <Package className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-3 text-base font-semibold text-gray-900">No products found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || categoryFilter !== "all" || conditionFilter !== "all" || statusFilter !== "all"
              ? "Try adjusting search terms or resetting filters."
              : "No product listings currently exist on the platform."}
          </p>
          {(searchQuery || categoryFilter !== "all" || conditionFilter !== "all" || statusFilter !== "all") && (
            <Button
              size="sm"
              variant="flat"
              className="mt-4"
              onPress={() => {
                setSearchQuery("");
                setCategoryFilter("all");
                setConditionFilter("all");
                setStatusFilter("all");
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-700">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category & Condition</th>
                  <th className="px-6 py-4">Price & Stock</th>
                  <th className="px-6 py-4">Seller Info</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => {
                  const isProcessing = actionLoadingId === product._id;
                  const isHidden = (product.status || "available") === "hidden";

                  return (
                    <tr key={product._id} className="transition hover:bg-gray-50/70">
                      {/* Product Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                            {product.image ? (
                              <Image
                                src={product.image}
                                alt={product.title || "Product"}
                                fill
                                sizes="48px"
                                className="object-contain p-1"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-gray-400">
                                <Package className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/products/${product._id}`}
                              className="font-semibold text-gray-900 hover:text-green-600 transition block truncate max-w-xs"
                            >
                              {product.title || "Untitled Product"}
                            </Link>
                            <p className="text-xs text-gray-400 font-mono truncate">
                              ID: {product._id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category & Condition */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                            <Tag className="h-3 w-3" />
                            {product.category || "General"}
                          </span>
                          <span className="text-xs text-gray-500">
                            Condition: {product.condition || "Used"}
                          </span>
                        </div>
                      </td>

                      {/* Price & Stock */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">
                            ৳{Number(product.price || 0).toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-500">
                            Stock: {product.stock != null ? product.stock : 1}
                          </span>
                        </div>
                      </td>

                      {/* Seller */}
                      <td className="px-6 py-4 text-xs text-gray-600">
                        <div className="flex items-center gap-1.5 font-medium text-gray-800">
                          <Store className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span className="truncate max-w-[150px]">
                            {product.sellerName || "Seller"}
                          </span>
                        </div>
                        <p className="mt-0.5 text-gray-400 truncate max-w-[180px]">
                          {product.sellerInfo || "N/A"}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                            isHidden
                              ? "bg-amber-100 text-amber-700"
                              : product.status === "sold"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          {product.status || "available"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* View Product Details */}
                          <Link
                            href={`/products/${product._id}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition"
                            title="View product details"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>

                          {/* Toggle Visibility */}
                          <Button
                            size="sm"
                            variant="flat"
                            color={isHidden ? "success" : "default"}
                            isDisabled={isProcessing}
                            onPress={() => handleToggleStatus(product)}
                            className="font-medium text-xs"
                            title={isHidden ? "Make visible to buyers" : "Hide from buyers"}
                          >
                            {isHidden ? (
                              <>
                                <Eye className="h-3.5 w-3.5" />
                                Unhide
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-3.5 w-3.5" />
                                Hide
                              </>
                            )}
                          </Button>

                          {/* Delete Button */}
                          <Button
                            size="sm"
                            variant="danger"
                            isDisabled={isProcessing}
                            onPress={() => setDeleteConfirmProduct(product)}
                            className="font-medium"
                            aria-label={`Delete ${product.title}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Product Listing</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Are you sure you want to permanently delete{" "}
                  <strong>{deleteConfirmProduct.title}</strong>?
                  This will remove the item from all search results and categories.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="tertiary"
                onPress={() => setDeleteConfirmProduct(null)}
                isDisabled={actionLoadingId === deleteConfirmProduct._id}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onPress={handleDeleteProduct}
                isLoading={actionLoadingId === deleteConfirmProduct._id}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}