"use client";

import { DeleteModal } from "@/components/Modals/DeleteModal";
import { EditProductModal } from "@/components/Modals/EditProductModal";
import { getMyProducts } from "@/lib/actions/myProducts";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import {
  Search,
  Filter,
  Package,
  Plus,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { Button } from "@heroui/react";

const statusColors = {
  available: "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50",
  hidden: "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50",
  sold: "bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/50",
  pending: "bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-800/50",
  rejected: "bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50",
};

function StatusBadge({ status }) {
  const normalized = status?.toLowerCase() || "available";
  const color =
    statusColors[normalized] ?? "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
  return (
    <span
      className={`inline-block text-xs px-2.5 py-0.5 rounded-full font-medium capitalize whitespace-nowrap ${color}`}
    >
      {status || "Available"}
    </span>
  );
}

export default function MyProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data } = useSession();
  const sellerInfo = data?.user?.email;

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  // Pagination State
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getMyProducts(sellerInfo);
        setProducts(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (sellerInfo) {
      fetchProducts();
    }
  }, [sellerInfo]);

  const handleDeleteSuccess = (deletedId) => {
    setProducts((prev) => prev.filter((p) => p._id !== deletedId));
  };

  const handleEditSuccess = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
    );
  };

  // Distinct categories in seller catalog
  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.title?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q);

      const matchesCategory =
        categoryFilter === "all" ||
        p.category?.toLowerCase() === categoryFilter.toLowerCase();

      const matchesCondition =
        conditionFilter === "all" ||
        p.condition?.toLowerCase() === conditionFilter.toLowerCase();

      const matchesStatus =
        statusFilter === "all" ||
        (p.status || "available").toLowerCase() === statusFilter.toLowerCase();

      const stockNum = Number(p.stock) || 0;
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "in_stock" ? stockNum > 0 : stockNum <= 0);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesCondition &&
        matchesStatus &&
        matchesStock
      );
    });
  }, [products, searchQuery, categoryFilter, conditionFilter, statusFilter, stockFilter]);

  // Paginated slice
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, page, itemsPerPage]);

  const hasActiveFilters =
    searchQuery ||
    categoryFilter !== "all" ||
    conditionFilter !== "all" ||
    statusFilter !== "all" ||
    stockFilter !== "all";

  const handleResetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setConditionFilter("all");
    setStatusFilter("all");
    setStockFilter("all");
    setPage(1);
  };

  if (loading) {
    return (
      <div
        className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-pulse"
        role="status"
        aria-label="Loading your products"
      >
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="h-8 w-44 bg-slate-200 rounded-md" />
          <div className="h-10 w-28 bg-slate-200 rounded-lg" />
        </div>
        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden p-6 space-y-4">
          <div className="h-6 bg-slate-100 rounded w-full" />
          <div className="h-12 bg-slate-50 rounded w-full" />
          <div className="h-12 bg-slate-50 rounded w-full" />
          <div className="h-12 bg-slate-50 rounded w-full" />
          <div className="h-12 bg-slate-50 rounded w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 transition-colors">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
            My Store Products
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Manage, search, and update listings across your store inventory ({products.length} total).
          </p>
        </div>
        <Link href="/dashboard/seller/products/add-products">
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium shadow-xs"
            startContent={<Plus className="h-4 w-4" />}
          >
            Add New Product
          </Button>
        </Link>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="mb-6 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-4">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search product title..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Category */}
          <div className="sm:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Condition */}
          <div className="sm:col-span-2">
            <select
              value={conditionFilter}
              onChange={(e) => {
                setConditionFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="all">All Conditions</option>
              <option value="used">Used</option>
              <option value="like new">Like New</option>
              <option value="refurbished">Refurbished</option>
            </select>
          </div>

          {/* Status */}
          <div className="sm:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="hidden">Hidden</option>
              <option value="sold">Sold</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Reset */}
          <div className="sm:col-span-1 flex items-center">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full flex items-center justify-center p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-medium transition cursor-pointer"
                title="Reset filters"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Empty Filter State ── */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-sm">
          <Package className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
            No products match your criteria
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {hasActiveFilters
              ? "Try adjusting search terms or resetting filters."
              : "You haven't listed any products in your store yet."}
          </p>
          {hasActiveFilters && (
            <Button
              size="sm"
              variant="flat"
              color="primary"
              className="mt-4"
              onPress={handleResetFilters}
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* ── Desktop table (lg+) ── */}
          <div className="hidden lg:block overflow-x-auto border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800/60 text-gray-500 dark:text-slate-400 uppercase text-xs tracking-wide border-b border-gray-200 dark:border-slate-800">
                <tr>
                  <th className="text-left px-6 py-4 w-1/4">Product Name</th>
                  <th className="text-left px-6 py-4">Condition</th>
                  <th className="text-left px-6 py-4">Price</th>
                  <th className="text-left px-6 py-4">Category</th>
                  <th className="text-left px-6 py-4">Stock</th>
                  <th className="text-left px-6 py-4 whitespace-nowrap w-[130px]">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 whitespace-nowrap w-[160px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800/70">
                {paginatedProducts.map((product) => (
                  <tr
                    key={product._id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="px-6 py-4 text-gray-800 dark:text-white font-medium">
                      <Link
                        href={`/products/${product._id}`}
                        className="hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline"
                      >
                        {product.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-300 capitalize">
                      {product.condition}
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-emerald-400 font-medium">
                      ৳{Number(product.price).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-300">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-300">
                      {product.stock != null ? product.stock : 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <EditProductModal product={product} onSuccess={handleEditSuccess} />
                        <DeleteModal id={product._id} onSuccess={handleDeleteSuccess} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Tablet grid (sm to lg) ── */}
          <div className="hidden sm:grid lg:hidden grid-cols-2 gap-4">
            {paginatedProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm p-4 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-sm font-semibold text-gray-800 dark:text-white leading-snug">
                    <Link
                      href={`/products/${product._id}`}
                      className="hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                      {product.title}
                    </Link>
                  </h2>
                  <StatusBadge status={product.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <div>
                    <span className="text-slate-400 block font-medium">Condition:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200 capitalize">
                      {product.condition}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Price:</span>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                      ৳{Number(product.price).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Category:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {product.category}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Stock:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {product.stock != null ? product.stock : 1}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-slate-800 mt-auto">
                  <EditProductModal product={product} onSuccess={handleEditSuccess} />
                  <DeleteModal id={product._id} onSuccess={handleDeleteSuccess} />
                </div>
              </div>
            ))}
          </div>

          {/* ── Mobile list (< sm) ── */}
          <div className="flex sm:hidden flex-col gap-3">
            {paginatedProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm p-4"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h2 className="text-sm font-semibold text-gray-800 dark:text-white leading-snug">
                    <Link
                      href={`/products/${product._id}`}
                      className="hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                      {product.title}
                    </Link>
                  </h2>
                  <StatusBadge status={product.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 mb-3">
                  <div>
                    <span className="text-slate-400 block font-medium">Condition:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200 capitalize">
                      {product.condition}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Price:</span>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                      ৳{Number(product.price).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Category:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {product.category}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Stock:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {product.stock != null ? product.stock : 1}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-slate-800">
                  <EditProductModal product={product} onSuccess={handleEditSuccess} />
                  <DeleteModal id={product._id} onSuccess={handleDeleteSuccess} />
                </div>
              </div>
            ))}
          </div>

          {/* ── Pagination Controls ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-slate-800 pt-4 mt-6">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Showing {((page - 1) * itemsPerPage) + 1} -{" "}
                {Math.min(page * itemsPerPage, filteredProducts.length)} of{" "}
                {filteredProducts.length} filtered products
              </p>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="flat"
                  isDisabled={page <= 1}
                  onPress={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="flat"
                  isDisabled={page >= totalPages}
                  onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
