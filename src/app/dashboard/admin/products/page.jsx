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
  Check,
  X,
  AlertTriangle,
  Flag,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { Button, AlertDialog } from "@heroui/react";
import toast from "react-hot-toast";
import { getProducts } from "@/lib/actions/getProducts";
import { deleteProducts, editProducts, moderateProduct } from "@/lib/actions/product";

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
  const [moderationConfirm, setModerationConfirm] = useState(null); // { product, action: 'approved' | 'rejected' }

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

  const handleModerateProduct = async () => {
    if (!moderationConfirm) return;
    const { product, action } = moderationConfirm;

    try {
      setActionLoadingId(product._id);
      await moderateProduct(product._id, action);

      setProducts((prev) =>
        prev.map((p) =>
          p._id === product._id
            ? {
                ...p,
                status: action === "approved" ? "available" : action,
                moderationStatus: action,
              }
            : p
        )
      );

      toast.success(
        action === "approved"
          ? "Product approved and published to marketplace"
          : "Product rejected and hidden from buyers"
      );
      setModerationConfirm(null);
    } catch (err) {
      console.error("Moderation error:", err);
      toast.error(err.message || "Failed to update moderation status");
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

      const prodStatus = (product.status || "available").toLowerCase();
      const modStatus = (product.moderationStatus || "").toLowerCase();

      let matchesStatus = true;
      if (statusFilter !== "all") {
        if (statusFilter === "pending") {
          matchesStatus = prodStatus === "pending" || modStatus === "pending";
        } else if (statusFilter === "rejected") {
          matchesStatus = prodStatus === "rejected" || modStatus === "rejected";
        } else if (statusFilter === "approved") {
          matchesStatus = modStatus === "approved" || prodStatus === "available";
        } else {
          matchesStatus = prodStatus === statusFilter.toLowerCase();
        }
      }

      return matchesSearch && matchesCategory && matchesCondition && matchesStatus;
    });
  }, [products, searchQuery, categoryFilter, conditionFilter, statusFilter]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = products.length;
    const totalValue = products.reduce((acc, p) => acc + (Number(p.price) || 0), 0);
    const available = products.filter(
      (p) =>
        (p.status || "available") === "available" &&
        p.moderationStatus !== "rejected" &&
        p.status !== "rejected"
    ).length;
    const pending = products.filter(
      (p) =>
        p.status === "pending" ||
        p.moderationStatus === "pending"
    ).length;
    const rejected = products.filter(
      (p) =>
        p.status === "rejected" ||
        p.moderationStatus === "rejected"
    ).length;
    return { total, totalValue, available, pending, rejected };
  }, [products]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 transition-colors">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Product Moderation & Catalog
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Review pending listings, approve or reject items, inspect seller credentials, and remove infringing products.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/admin/reports">
            <Button
              color="default"
              variant="flat"
              startContent={<Flag className="h-4 w-4 text-rose-500" />}
            >
              Reported Items
            </Button>
          </Link>

          <Button
            color="default"
            variant="flat"
            startContent={<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />}
            onPress={handleRefresh}
            isDisabled={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Aggregate Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Listings</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Pending Review</p>
          <p className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-400">{stats.pending}</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Approved & Active</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-400">{stats.available}</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <p className="text-xs font-medium text-rose-600 dark:text-rose-400">Rejected</p>
          <p className="mt-1 text-2xl font-bold text-rose-700 dark:text-rose-400">{stats.rejected}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
          {/* Search */}
          <div className="relative sm:col-span-5">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, seller email, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
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
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="all">All Conditions</option>
              <option value="used">Used</option>
              <option value="like new">Like New</option>
              <option value="refurbished">Refurbished</option>
            </select>
          </div>

          {/* Moderation / Status Filter */}
          <div className="sm:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
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
        <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
          <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">Loading product catalog...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-14 text-center">
          <Package className="mx-auto h-12 w-12 text-gray-300 dark:text-slate-600" />
          <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">No products found</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {searchQuery || categoryFilter !== "all" || conditionFilter !== "all" || statusFilter !== "all"
              ? "Try adjusting search terms or resetting filters."
              : "No product listings currently exist on the platform."}
          </p>
          {(searchQuery || categoryFilter !== "all" || conditionFilter !== "all" || statusFilter !== "all") && (
            <Button
              size="sm"
              variant="flat"
              color="primary"
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
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category & Condition</th>
                  <th className="px-6 py-4">Price & Stock</th>
                  <th className="px-6 py-4">Seller Info</th>
                  <th className="px-6 py-4">Moderation / Status</th>
                  <th className="px-6 py-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProducts.map((product) => {
                  const isProcessing = actionLoadingId === product._id;
                  const isHidden = (product.status || "available") === "hidden";
                  const isPending =
                    product.status === "pending" ||
                    product.moderationStatus === "pending";
                  const isRejected =
                    product.status === "rejected" ||
                    product.moderationStatus === "rejected";
                  const isApproved =
                    (product.moderationStatus === "approved" ||
                      product.status === "available") &&
                    !isRejected &&
                    !isPending;

                  return (
                    <tr key={product._id} className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                      {/* Product Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                            {product.image ? (
                              <Image
                                src={product.image}
                                alt={product.title || "Product"}
                                fill
                                sizes="48px"
                                className="object-contain p-1"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-400">
                                <Package className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/products/${product._id}`}
                              className="font-semibold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition block truncate max-w-xs"
                            >
                              {product.title || "Untitled Product"}
                            </Link>
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-mono truncate">
                              ID: {product._id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category & Condition */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
                            <Tag className="h-3 w-3" />
                            {product.category || "General"}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Condition: {product.condition || "Used"}
                          </span>
                        </div>
                      </td>

                      {/* Price & Stock */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-white">
                            ৳{Number(product.price || 0).toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Stock: {product.stock != null ? product.stock : 1}
                          </span>
                        </div>
                      </td>

                      {/* Seller */}
                      <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                          <Store className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[150px]">
                            {product.sellerName || "Seller"}
                          </span>
                        </div>
                        <p className="mt-0.5 text-slate-400 dark:text-slate-500 truncate max-w-[180px]">
                          {product.sellerInfo || "N/A"}
                        </p>
                      </td>

                      {/* Moderation / Status */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {isPending && (
                            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 px-2.5 py-0.5 text-xs font-semibold">
                              <Clock className="h-3 w-3" />
                              Pending Review
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 px-2.5 py-0.5 text-xs font-semibold">
                              <X className="h-3 w-3" />
                              Rejected
                            </span>
                          )}
                          {isApproved && (
                            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-2.5 py-0.5 text-xs font-semibold">
                              <CheckCircle2 className="h-3 w-3" />
                              Approved
                            </span>
                          )}
                          {isHidden && (
                            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-2.5 py-0.5 text-xs font-medium">
                              <EyeOff className="h-3 w-3" />
                              Hidden
                            </span>
                          )}
                          {product.status === "sold" && (
                            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 px-2.5 py-0.5 text-xs font-medium">
                              Sold
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Approve Action */}
                          {(!isApproved || isPending || isRejected) && (
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-2.5 h-8 min-w-0"
                              isDisabled={isProcessing}
                              onPress={() =>
                                setModerationConfirm({ product, action: "approved" })
                              }
                              title="Approve and publish this product"
                            >
                              <Check className="h-3.5 w-3.5 mr-1" />
                              Approve
                            </Button>
                          )}

                          {/* Reject Action */}
                          {!isRejected && (
                            <Button
                              size="sm"
                              variant="flat"
                              color="danger"
                              className="px-2.5 h-8 min-w-0 font-medium"
                              isDisabled={isProcessing}
                              onPress={() =>
                                setModerationConfirm({ product, action: "rejected" })
                              }
                              title="Reject this product listing"
                            >
                              <X className="h-3.5 w-3.5 mr-1" />
                              Reject
                            </Button>
                          )}

                          {/* View Product Details */}
                          <Link
                            href={`/products/${product._id}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition"
                            title="View public product details"
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
                            className="h-8 w-8 min-w-0 p-0"
                            title={isHidden ? "Show product to buyers" : "Hide product from buyers"}
                          >
                            {isHidden ? <Eye className="h-4 w-4 text-emerald-600" /> : <EyeOff className="h-4 w-4 text-slate-500" />}
                          </Button>

                          {/* Delete Product */}
                          <Button
                            size="sm"
                            variant="flat"
                            color="danger"
                            isDisabled={isProcessing}
                            onPress={() => setDeleteConfirmProduct(product)}
                            className="h-8 w-8 min-w-0 p-0"
                            title="Permanently remove listing"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Moderation Confirmation Modal */}
      {moderationConfirm && (
        <AlertDialog>
          <AlertDialog.Backdrop
            isOpen={!!moderationConfirm}
            onOpenChange={(open) => {
              if (!open) setModerationConfirm(null);
            }}
            isDismissable={actionLoadingId !== moderationConfirm.product._id}
          >
            <AlertDialog.Container>
              <AlertDialog.Dialog className="sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-6 rounded-2xl shadow-xl">
                <AlertDialog.Header className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      moderationConfirm.action === "approved"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                    }`}
                  >
                    {moderationConfirm.action === "approved" ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <AlertDialog.Heading className="text-lg font-bold text-slate-900 dark:text-white">
                      {moderationConfirm.action === "approved"
                        ? "Approve Product Listing"
                        : "Reject Product Listing"}
                    </AlertDialog.Heading>
                  </div>
                </AlertDialog.Header>

                <AlertDialog.Body className="mt-3">
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {moderationConfirm.action === "approved" ? (
                      <>
                        Are you sure you want to approve{" "}
                        <strong className="text-slate-900 dark:text-white">
                          {moderationConfirm.product.title}
                        </strong>
                        ? The product will be marked as available in the public catalog for buyers to purchase.
                      </>
                    ) : (
                      <>
                        Are you sure you want to reject{" "}
                        <strong className="text-slate-900 dark:text-white">
                          {moderationConfirm.product.title}
                        </strong>
                        ? It will be removed from buyer search results and will not be eligible for checkout.
                      </>
                    )}
                  </p>
                </AlertDialog.Body>

                <AlertDialog.Footer className="mt-6 flex justify-end gap-3">
                  <Button
                    variant="flat"
                    color="default"
                    onPress={() => setModerationConfirm(null)}
                    isDisabled={actionLoadingId === moderationConfirm.product._id}
                  >
                    Cancel
                  </Button>
                  <Button
                    className={
                      moderationConfirm.action === "approved"
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                        : "bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                    }
                    onPress={handleModerateProduct}
                    isLoading={actionLoadingId === moderationConfirm.product._id}
                  >
                    {moderationConfirm.action === "approved"
                      ? "Confirm Approval"
                      : "Confirm Rejection"}
                  </Button>
                </AlertDialog.Footer>
              </AlertDialog.Dialog>
            </AlertDialog.Container>
          </AlertDialog.Backdrop>
        </AlertDialog>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmProduct && (
        <AlertDialog>
          <AlertDialog.Backdrop
            isOpen={!!deleteConfirmProduct}
            onOpenChange={(open) => {
              if (!open) setDeleteConfirmProduct(null);
            }}
            isDismissable={actionLoadingId !== deleteConfirmProduct._id}
            isKeyboardDismissDisabled={actionLoadingId === deleteConfirmProduct._id}
          >
            <AlertDialog.Container>
              <AlertDialog.Dialog className="sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-6 rounded-2xl shadow-xl">
                <AlertDialog.Header className="flex items-start gap-3">
                  <AlertDialog.Icon status="danger" />
                  <div>
                    <AlertDialog.Heading className="text-lg font-bold text-slate-900 dark:text-white">
                      Delete Product Listing
                    </AlertDialog.Heading>
                  </div>
                </AlertDialog.Header>
                <AlertDialog.Body className="mt-3">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Are you sure you want to permanently delete{" "}
                    <strong className="text-slate-900 dark:text-white">
                      {deleteConfirmProduct.title}
                    </strong>
                    ? This will remove the item from all search results and categories.
                  </p>
                </AlertDialog.Body>
                <AlertDialog.Footer className="mt-6 flex justify-end gap-3">
                  <Button
                    variant="flat"
                    color="default"
                    onPress={() => setDeleteConfirmProduct(null)}
                    isDisabled={actionLoadingId === deleteConfirmProduct._id}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                    onPress={handleDeleteProduct}
                    isLoading={actionLoadingId === deleteConfirmProduct._id}
                  >
                    Confirm Delete
                  </Button>
                </AlertDialog.Footer>
              </AlertDialog.Dialog>
            </AlertDialog.Container>
          </AlertDialog.Backdrop>
        </AlertDialog>
      )}
    </div>
  );
}
