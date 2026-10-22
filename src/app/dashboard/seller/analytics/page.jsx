"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  PackageCheck,
  Package,
  Clock,
  Truck,
  XCircle,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Sparkles,
  BarChart3,
  Tag,
  Store,
} from "lucide-react";
import { Button } from "@heroui/react";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { getOrdersBySellerInfo } from "@/lib/actions/orders";
import { getMyProducts } from "@/lib/actions/myProducts";

export default function SellerAnalyticsPage() {
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const sellerEmail = session?.user?.email;

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSellerData = async (email) => {
    if (!email) return;

    try {
      const [ordersData, productsData] = await Promise.all([
        getOrdersBySellerInfo(email).catch((err) => {
          console.warn("Failed to fetch seller orders for analytics:", err);
          return [];
        }),
        getMyProducts(email).catch((err) => {
          console.warn("Failed to fetch seller products for analytics:", err);
          return [];
        }),
      ]);

      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
      setError(null);
    } catch (err) {
      console.error("Seller analytics load error:", err);
      setError(err.message || "Failed to load seller analytics.");
      toast.error(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!sellerEmail) return;
    setLoading(true);
    await loadSellerData(sellerEmail);
  };

  useEffect(() => {
    let ignore = false;
    async function init() {
      if (!sellerEmail) {
        if (!sessionLoading) {
          setLoading(false);
        }
        return;
      }

      try {
        const [ordersData, productsData] = await Promise.all([
          getOrdersBySellerInfo(sellerEmail).catch(() => []),
          getMyProducts(sellerEmail).catch(() => []),
        ]);

        if (!ignore) {
          setOrders(Array.isArray(ordersData) ? ordersData : []);
          setProducts(Array.isArray(productsData) ? productsData : []);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Failed to load seller analytics.");
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
  }, [sellerEmail, sessionLoading]);

  // Compute metrics from actual seller data
  const metrics = useMemo(() => {
    const totalProducts = products.length;
    const availableProducts = products.filter(
      (p) => (p.status || "available") === "available"
    ).length;
    const totalInventoryValue = products.reduce(
      (sum, p) => sum + (Number(p.price) || 0),
      0
    );

    const totalOrders = orders.length;

    // Only count paid & non-rejected/cancelled orders toward earned revenue
    const validPaidOrders = orders.filter(
      (o) =>
        o.paymentStatus === "paid" &&
        o.orderStatus !== "rejected" &&
        o.orderStatus !== "cancelled"
    );

    const totalRevenue = validPaidOrders.reduce(
      (sum, o) => sum + (Number(o.price) || 0),
      0
    );

    const completedSales = orders.filter(
      (o) => o.orderStatus === "delivered"
    ).length;

    const pendingOrders = orders.filter(
      (o) => (o.orderStatus || "pending") === "pending"
    ).length;

    const processingOrders = orders.filter(
      (o) => o.orderStatus === "processing"
    ).length;

    const shippedOrders = orders.filter(
      (o) => o.orderStatus === "shipped"
    ).length;

    const rejectedOrders = orders.filter(
      (o) => o.orderStatus === "rejected"
    ).length;

    const avgOrderValue =
      validPaidOrders.length > 0
        ? Math.round(totalRevenue / validPaidOrders.length)
        : 0;

    // Top-performing products by orders and revenue
    const productPerformanceMap = {};
    orders.forEach((o) => {
      const id = o.productId || o.productTitle || "Unknown Product";
      if (!productPerformanceMap[id]) {
        productPerformanceMap[id] = {
          title: o.productTitle || "Product",
          ordersCount: 0,
          revenue: 0,
        };
      }
      productPerformanceMap[id].ordersCount += 1;
      if (
        o.paymentStatus === "paid" &&
        o.orderStatus !== "rejected" &&
        o.orderStatus !== "cancelled"
      ) {
        productPerformanceMap[id].revenue += Number(o.price) || 0;
      }
    });

    const topProducts = Object.values(productPerformanceMap).sort(
      (a, b) => b.revenue - a.revenue || b.ordersCount - a.ordersCount
    );

    const fulfillmentStages = [
      { key: "pending", label: "Pending", count: pendingOrders, color: "bg-yellow-500" },
      { key: "accepted", label: "Accepted", count: orders.filter((o) => o.orderStatus === "accepted").length, color: "bg-blue-500" },
      { key: "processing", label: "Processing", count: processingOrders, color: "bg-indigo-500" },
      { key: "shipped", label: "Shipped", count: shippedOrders, color: "bg-purple-500" },
      { key: "delivered", label: "Delivered", count: completedSales, color: "bg-green-500" },
      { key: "rejected", label: "Rejected", count: rejectedOrders, color: "bg-red-500" },
    ];

    return {
      totalProducts,
      availableProducts,
      totalInventoryValue,
      totalOrders,
      totalRevenue,
      completedSales,
      pendingOrders,
      avgOrderValue,
      topProducts,
      fulfillmentStages,
    };
  }, [orders, products]);

  if (sessionLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <RefreshCw className="h-6 w-6 animate-spin text-green-600" />
      </div>
    );
  }

  if (!sellerEmail) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <Store className="mx-auto h-12 w-12 text-gray-300" />
        <h2 className="mt-3 text-lg font-bold text-gray-900">Authentication Required</h2>
        <p className="mt-1 text-sm text-gray-500">
          Please log in with your seller account to view your store analytics.
        </p>
        <Link href="/auth/login" className="mt-4 inline-block">
          <Button color="primary" className="bg-green-600 text-white font-medium">
            Go to Login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 mb-2">
            <TrendingUp className="h-3.5 w-3.5" />
            Store Performance
          </div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Seller Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Real performance metrics and sales trends for {sellerEmail}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            color="default"
            variant="flat"
            startContent={<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />}
            onPress={handleRefresh}
            isDisabled={loading}
          >
            Refresh
          </Button>

          <Link href="/dashboard/seller/products/add-products">
            <Button color="primary" className="bg-green-600 text-white font-semibold">
              + Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-5 w-5 text-red-600 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Unable to load analytics</p>
            <p className="mt-0.5 text-xs text-red-700">{error}</p>
          </div>
          <Button size="sm" color="danger" variant="flat" onPress={() => loadSellerData(sellerEmail)}>
            Retry
          </Button>
        </div>
      )}

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Earned Revenue
            </p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-gray-900">
            ৳{metrics.totalRevenue.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Avg Order: ৳{metrics.avgOrderValue.toLocaleString()}
          </p>
        </div>

        {/* Total Sales / Delivered */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Completed Sales
            </p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <PackageCheck className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-gray-900">
            {metrics.completedSales}
          </p>
          <p className="mt-1 text-xs text-green-600 font-medium">
            {metrics.totalOrders > 0
              ? `${Math.round((metrics.completedSales / metrics.totalOrders) * 100)}% fulfillment rate`
              : "0 total orders"}
          </p>
        </div>

        {/* Pending Orders */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action Needed
            </p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-gray-900">
            {metrics.pendingOrders}
          </p>
          <p className="mt-1 text-xs text-amber-600 font-medium">
            Pending customer orders
          </p>
        </div>

        {/* Listed Inventory */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Active Listings
            </p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-gray-900">
            {metrics.totalProducts}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            ৳{metrics.totalInventoryValue.toLocaleString()} inventory valuation
          </p>
        </div>
      </div>

      {/* Empty State when seller has no products at all */}
      {!loading && products.length === 0 && orders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
          <Store className="mx-auto h-12 w-12 text-gray-300" />
          <h2 className="mt-4 text-xl font-bold text-gray-900">
            No listings yet in your store
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 leading-relaxed">
            Start listing pre-owned electronics, furniture, or accessories to generate sales and unlock performance analytics.
          </p>
          <div className="mt-6 flex justify-center">
            <Link href="/dashboard/seller/products/add-products">
              <Button color="primary" className="bg-green-600 text-white font-semibold px-6 py-2.5">
                List Your First Product
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Order Stages Breakdown */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">Order Delivery Status</h2>
                <p className="text-xs text-gray-500">Breakdown of orders by fulfillment step</p>
              </div>
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                {metrics.totalOrders} total orders
              </span>
            </div>

            {metrics.totalOrders === 0 ? (
              <div className="py-12 text-center text-sm text-gray-400">
                No orders have been received yet for your listings.
              </div>
            ) : (
              <div className="space-y-4">
                {metrics.fulfillmentStages.map((stage) => {
                  const percentage =
                    metrics.totalOrders > 0
                      ? Math.round((stage.count / metrics.totalOrders) * 100)
                      : 0;

                  return (
                    <div key={stage.key} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-700">{stage.label}</span>
                        <span className="text-gray-500">
                          {stage.count} orders ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${stage.color}`}
                          style={{
                            width: `${Math.max(percentage, stage.count > 0 ? 5 : 0)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top Performing Listings */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">Top Selling Products</h2>
                <p className="text-xs text-gray-500">Items generating the most orders and revenue</p>
              </div>
              <Link
                href="/dashboard/seller/products/my-products"
                className="text-xs font-semibold text-green-600 hover:underline flex items-center gap-1"
              >
                View all
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {metrics.topProducts.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-400">
                No sales recorded yet. Once customers purchase your items, top performers will appear here.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {metrics.topProducts.slice(0, 5).map((item, index) => (
                  <div
                    key={item.title + index}
                    className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                          {index + 1}
                        </span>
                        <p className="truncate font-medium text-gray-900 text-sm max-w-xs">
                          {item.title}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 pl-7 mt-0.5">
                        {item.ordersCount} {item.ordersCount === 1 ? "order" : "orders"}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-bold text-gray-900 text-sm">
                        ৳{item.revenue.toLocaleString()}
                      </p>
                      <p className="text-xs text-green-600">Earned</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Action Navigation */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-gray-900 text-base">Looking for order details?</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage status changes (Accept, Process, Ship, Deliver) directly on the orders table.
          </p>
        </div>
        <Link href="/dashboard/seller/orders">
          <Button color="primary" className="bg-black text-white font-medium hover:bg-gray-800">
            Go to Manage Orders
          </Button>
        </Link>
      </div>
    </div>
  );
}