"use client";

import { useEffect, useState, useMemo } from "react";
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  XCircle,
  AlertCircle,
  RefreshCw,
  CreditCard,
  User,
  Store,
  DollarSign,
  Trash2,
  Info,
} from "lucide-react";
import { Button } from "@heroui/react";
import toast from "react-hot-toast";
import { getAdminOrders, updateOrderStatus, deleteOrder } from "@/lib/actions/orders";

const ORDER_STATUS_OPTIONS = [
  "pending",
  "accepted",
  "processing",
  "shipped",
  "delivered",
  "rejected",
];

const ORDER_STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");

  // In-flight mutations
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [cancelConfirmOrder, setCancelConfirmOrder] = useState(null);

  const loadOrders = async () => {
    try {
      const data = await getAdminOrders();
      setOrders(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error("Failed to load admin orders:", err);
      setError(err.message || "Failed to load platform orders.");
      toast.error(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await loadOrders();
  };

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const data = await getAdminOrders();
        if (!ignore) {
          setOrders(Array.isArray(data) ? data : []);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Failed to load platform orders.");
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

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setActionLoadingId(orderId);
      await updateOrderStatus(orderId, newStatus);

      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      );

      toast.success(`Order status updated to ${newStatus}`);
    } catch (err) {
      console.error("Update order status error:", err);
      toast.error(err.message || "Failed to update order status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelConfirmOrder) return;
    const orderId = cancelConfirmOrder._id;

    try {
      setActionLoadingId(orderId);
      await deleteOrder(orderId);

      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      toast.success("Order cancelled and removed successfully");
      setCancelConfirmOrder(null);
    } catch (err) {
      console.error("Cancel order error:", err);
      toast.error(err.message || "Failed to cancel order");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        order._id?.toLowerCase().includes(q) ||
        order.productTitle?.toLowerCase().includes(q) ||
        order.buyerName?.toLowerCase().includes(q) ||
        order.buyerInfo?.toLowerCase().includes(q) ||
        order.sellerName?.toLowerCase().includes(q) ||
        order.sellerInfo?.toLowerCase().includes(q) ||
        order.paymentId?.toLowerCase().includes(q);

      const oStatus = (order.orderStatus || "pending").toLowerCase();
      const matchesOrderStatus =
        orderStatusFilter === "all" || oStatus === orderStatusFilter.toLowerCase();

      const pStatus = (order.paymentStatus || "pending").toLowerCase();
      const matchesPaymentStatus =
        paymentStatusFilter === "all" || pStatus === paymentStatusFilter.toLowerCase();

      return matchesSearch && matchesOrderStatus && matchesPaymentStatus;
    });
  }, [orders, searchQuery, orderStatusFilter, paymentStatusFilter]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => (o.orderStatus || "pending") === "pending").length;
    const delivered = orders.filter((o) => o.orderStatus === "delivered").length;
    const paidRevenue = orders
      .filter((o) => o.paymentStatus === "paid" && o.orderStatus !== "rejected" && o.orderStatus !== "cancelled")
      .reduce((sum, o) => sum + (Number(o.price) || 0), 0);

    return { total, pending, delivered, paidRevenue };
  }, [orders]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Manage Orders</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor real orders across the platform, oversee delivery flows, and resolve transaction disputes.
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
          <p className="text-xs font-medium text-gray-500">Total Orders</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-amber-600">Pending Orders</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{stats.pending}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-green-600">Delivered Orders</p>
          <p className="mt-1 text-2xl font-bold text-green-700">{stats.delivered}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-blue-600">Paid Volume</p>
          <p className="mt-1 text-2xl font-bold text-blue-700">৳{stats.paidRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
          {/* Search */}
          <div className="relative sm:col-span-6">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID, product, buyer, seller, or transaction..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
            />
          </div>

          {/* Order Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600 capitalize"
            >
              <option value="all">All Order Statuses</option>
              {ORDER_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
            >
              <option value="all">All Payment Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Payment Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Backend Architecture Note */}
      <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-800 flex items-start gap-2.5">
        <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Real Data Aggregation:</span> Orders are aggregated in real time from registered marketplace sellers and buyers using authenticated admin queries (`/api/seller/orders` & `/api/buyer/orders`). Status modifications and dispute cancellations are fully enforced on the Express backend.
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-5 w-5 text-red-600 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Unable to load orders</p>
            <p className="mt-0.5 text-xs text-red-700">{error}</p>
          </div>
          <Button size="sm" color="danger" variant="flat" onPress={loadOrders}>
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
          <p className="mt-3 text-sm font-medium text-gray-700">Loading marketplace orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-3 text-base font-semibold text-gray-900">No orders found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || orderStatusFilter !== "all" || paymentStatusFilter !== "all"
              ? "No orders match the selected filter criteria."
              : "No customer orders have been placed on the marketplace yet."}
          </p>
          {(searchQuery || orderStatusFilter !== "all" || paymentStatusFilter !== "all") && (
            <Button
              size="sm"
              variant="flat"
              className="mt-4"
              onPress={() => {
                setSearchQuery("");
                setOrderStatusFilter("all");
                setPaymentStatusFilter("all");
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
                  <th className="px-6 py-4">Order / Product</th>
                  <th className="px-6 py-4">Buyer Info</th>
                  <th className="px-6 py-4">Seller Info</th>
                  <th className="px-6 py-4">Amount & Payment</th>
                  <th className="px-6 py-4">Order Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => {
                  const isProcessing = actionLoadingId === order._id;
                  const currentStatus = order.orderStatus || "pending";
                  const isPaid = (order.paymentStatus || "").toLowerCase() === "paid";

                  return (
                    <tr key={order._id} className="transition hover:bg-gray-50/70">
                      {/* Product & Order Details */}
                      <td className="px-6 py-4">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate max-w-xs">
                            {order.productTitle || "Product Item"}
                          </p>
                          <p className="text-xs text-gray-400 font-mono mt-0.5 truncate">
                            ID: {order._id}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString()
                              : "Date not recorded"}
                          </p>
                        </div>
                      </td>

                      {/* Buyer */}
                      <td className="px-6 py-4 text-xs">
                        <div className="flex items-center gap-1.5 font-medium text-gray-800">
                          <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span className="truncate max-w-[140px]">
                            {order.buyerName || "Buyer"}
                          </span>
                        </div>
                        <p className="text-gray-400 truncate max-w-[160px] mt-0.5">
                          {order.buyerInfo || "N/A"}
                        </p>
                      </td>

                      {/* Seller */}
                      <td className="px-6 py-4 text-xs">
                        <div className="flex items-center gap-1.5 font-medium text-gray-800">
                          <Store className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span className="truncate max-w-[140px]">
                            {order.sellerName || "Seller"}
                          </span>
                        </div>
                        <p className="text-gray-400 truncate max-w-[160px] mt-0.5">
                          {order.sellerInfo || "N/A"}
                        </p>
                      </td>

                      {/* Amount & Payment Status */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-gray-900">
                            ৳{Number(order.price || 0).toLocaleString()}
                          </span>
                          <span
                            className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                              isPaid
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            <CreditCard className="h-3 w-3" />
                            {isPaid ? "Paid" : "Payment Pending"}
                          </span>
                        </div>
                      </td>

                      {/* Order Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                            ORDER_STATUS_COLORS[currentStatus] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {currentStatus === "delivered" ? (
                            <PackageCheck className="h-3 w-3" />
                          ) : currentStatus === "shipped" ? (
                            <Truck className="h-3 w-3" />
                          ) : currentStatus === "rejected" ? (
                            <XCircle className="h-3 w-3" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                          {currentStatus}
                        </span>
                      </td>

                      {/* Status Management Dropdown & Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Status Select */}
                          <select
                            value={currentStatus}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            disabled={isProcessing}
                            className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600 capitalize cursor-pointer disabled:opacity-50"
                          >
                            {ORDER_STATUS_OPTIONS.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>

                          {/* Cancel / Delete Order */}
                          <Button
                            size="sm"
                            variant="danger"
                            isDisabled={isProcessing}
                            onPress={() => setCancelConfirmOrder(order)}
                            className="font-medium"
                            aria-label={`Cancel order ${order._id}`}
                            title="Cancel / Delete order"
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

      {/* Cancel Order Confirmation Modal */}
      {cancelConfirmOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Cancel & Delete Order</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Are you sure you want to cancel and delete order{" "}
                  <strong className="font-mono">{cancelConfirmOrder._id}</strong> for{" "}
                  <strong>{cancelConfirmOrder.productTitle}</strong>?
                  This action is permanent and removes the order record.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="tertiary"
                onPress={() => setCancelConfirmOrder(null)}
                isDisabled={actionLoadingId === cancelConfirmOrder._id}
              >
                Go Back
              </Button>
              <Button
                variant="danger"
                onPress={handleCancelOrder}
                isLoading={actionLoadingId === cancelConfirmOrder._id}
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}