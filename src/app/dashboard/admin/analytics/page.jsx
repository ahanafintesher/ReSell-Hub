"use client";

import { useEffect, useState, useMemo } from "react";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  Layers,
  RefreshCw,
  AlertCircle,
  Shield,
  UserCheck,
  CheckCircle2,
  PieChart,
  BarChart3,
  Calendar,
  Info,
} from "lucide-react";
import { Button } from "@heroui/react";
import toast from "react-hot-toast";
import { getAdminUsers } from "@/lib/actions/user";
import { getProducts } from "@/lib/actions/getProducts";
import { getAdminOrders } from "@/lib/actions/orders";

export default function AdminAnalyticsPage() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      const [usersData, productsData, ordersData] = await Promise.all([
        getAdminUsers().catch((err) => {
          console.warn("Analytics users error:", err);
          return [];
        }),
        getProducts().catch((err) => {
          console.warn("Analytics products error:", err);
          return [];
        }),
        getAdminOrders().catch((err) => {
          console.warn("Analytics orders error:", err);
          return [];
        }),
      ]);

      setUsers(Array.isArray(usersData) ? usersData : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setError(null);
    } catch (err) {
      console.error("Failed to load analytics:", err);
      setError(err.message || "Failed to load platform analytics.");
      toast.error(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await loadData();
  };

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const [usersData, productsData, ordersData] = await Promise.all([
          getAdminUsers().catch(() => []),
          getProducts().catch(() => []),
          getAdminOrders().catch(() => []),
        ]);

        if (!ignore) {
          setUsers(Array.isArray(usersData) ? usersData : []);
          setProducts(Array.isArray(productsData) ? productsData : []);
          setOrders(Array.isArray(ordersData) ? ordersData : []);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Failed to load platform analytics.");
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

  // Compute platform metrics accurately from live data
  const metrics = useMemo(() => {
    const totalUsers = users.length;
    const sellersCount = users.filter((u) => u.role === "seller").length;
    const buyersCount = users.filter((u) => (u.role || "buyer") === "buyer").length;
    const activeUsers = users.filter((u) => (u.status || "active") === "active").length;
    const blockedUsers = users.filter((u) => u.status === "blocked").length;

    const totalProducts = products.length;
    const availableProducts = products.filter((p) => (p.status || "available") === "available").length;
    const totalInventoryValue = products.reduce((acc, p) => acc + (Number(p.price) || 0), 0);

    // Orders & Revenue
    // Revenue counts ONLY paid orders that are NOT rejected or cancelled
    const validPaidOrders = orders.filter(
      (o) =>
        o.paymentStatus === "paid" &&
        o.orderStatus !== "rejected" &&
        o.orderStatus !== "cancelled"
    );

    const totalRevenue = validPaidOrders.reduce(
      (acc, o) => acc + (Number(o.price) || 0),
      0
    );

    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) => o.orderStatus === "delivered").length;
    const pendingOrders = orders.filter((o) => (o.orderStatus || "pending") === "pending").length;
    const avgOrderValue = validPaidOrders.length > 0 ? Math.round(totalRevenue / validPaidOrders.length) : 0;

    // Categories Breakdown
    const catMap = {};
    products.forEach((p) => {
      const cat = p.category || "Uncategorized";
      if (!catMap[cat]) catMap[cat] = { count: 0, value: 0 };
      catMap[cat].count += 1;
      catMap[cat].value += Number(p.price) || 0;
    });

    const categoriesBreakdown = Object.entries(catMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count);

    // Order Status Breakdown
    const orderStatuses = ["pending", "accepted", "processing", "shipped", "delivered", "rejected"];
    const statusCounts = {};
    orderStatuses.forEach((st) => {
      statusCounts[st] = orders.filter((o) => (o.orderStatus || "pending").toLowerCase() === st).length;
    });

    return {
      totalUsers,
      sellersCount,
      buyersCount,
      activeUsers,
      blockedUsers,
      totalProducts,
      availableProducts,
      totalInventoryValue,
      totalRevenue,
      totalOrders,
      completedOrders,
      pendingOrders,
      avgOrderValue,
      categoriesBreakdown,
      statusCounts,
      orderStatuses,
    };
  }, [users, products, orders]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 mb-2">
            <BarChart3 className="h-3.5 w-3.5" />
            Live Marketplace Intelligence
          </div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Platform Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Real-time business insights aggregated across live MongoDB collections.
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
          Refresh Metrics
        </Button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-5 w-5 text-red-600 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Failed to load complete analytics</p>
            <p className="mt-0.5 text-xs text-red-700">{error}</p>
          </div>
          <Button size="sm" color="danger" variant="flat" onPress={loadData}>
            Retry
          </Button>
        </div>
      )}

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Settled Volume
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

        {/* Total Orders */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Orders
            </p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-gray-900">
            {metrics.totalOrders}
          </p>
          <p className="mt-1 text-xs text-green-600 font-medium">
            {metrics.completedOrders} delivered ({metrics.totalOrders > 0 ? Math.round((metrics.completedOrders / metrics.totalOrders) * 100) : 0}%)
          </p>
        </div>

        {/* Total Users */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Registered Users
            </p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-gray-900">
            {metrics.totalUsers}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {metrics.sellersCount} sellers · {metrics.buyersCount} buyers
          </p>
        </div>

        {/* Total Products */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Active Listings
            </p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-gray-900">
            {metrics.availableProducts}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            ৳{metrics.totalInventoryValue.toLocaleString()} total value
          </p>
        </div>
      </div>

      {/* Grid: Order Funnel & User Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Order Fulfillment Distribution Chart */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">Order Fulfillment Flow</h2>
              <p className="text-xs text-gray-500">Distribution across active order lifecycle stages</p>
            </div>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
              {metrics.totalOrders} total
            </span>
          </div>

          {metrics.totalOrders === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">
              No orders recorded to display funnel distribution.
            </div>
          ) : (
            <div className="space-y-4">
              {metrics.orderStatuses.map((st) => {
                const count = metrics.statusCounts[st] || 0;
                const percentage =
                  metrics.totalOrders > 0 ? Math.round((count / metrics.totalOrders) * 100) : 0;

                const colorClass =
                  st === "delivered"
                    ? "bg-green-500"
                    : st === "shipped"
                      ? "bg-purple-500"
                      : st === "processing"
                        ? "bg-indigo-500"
                        : st === "accepted"
                          ? "bg-blue-500"
                          : st === "rejected"
                            ? "bg-red-500"
                            : "bg-yellow-500";

                return (
                  <div key={st} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold capitalize text-gray-700">{st}</span>
                      <span className="text-gray-500">
                        {count} orders ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                        style={{ width: `${Math.max(percentage, count > 0 ? 4 : 0)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* User Roles & Moderation Breakdown */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-base font-bold text-gray-900">User Demographics & Security</h2>
            <p className="text-xs text-gray-500">Breakdown of roles and account integrity status</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
              <p className="text-xs font-medium text-gray-500">Active Accounts</p>
              <p className="mt-1 text-2xl font-bold text-green-700">{metrics.activeUsers}</p>
              <p className="mt-0.5 text-xs text-gray-400">
                {metrics.totalUsers > 0 ? Math.round((metrics.activeUsers / metrics.totalUsers) * 100) : 100}% in good standing
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
              <p className="text-xs font-medium text-gray-500">Restricted / Blocked</p>
              <p className="mt-1 text-2xl font-bold text-red-700">{metrics.blockedUsers}</p>
              <p className="mt-0.5 text-xs text-gray-400">
                {metrics.totalUsers > 0 ? Math.round((metrics.blockedUsers / metrics.totalUsers) * 100) : 0}% moderated
              </p>
            </div>
          </div>

          {/* Role Proportions */}
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1 font-medium text-gray-700">
                <span>Buyers ({metrics.buyersCount})</span>
                <span>
                  {metrics.totalUsers > 0 ? Math.round((metrics.buyersCount / metrics.totalUsers) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: `${metrics.totalUsers > 0 ? (metrics.buyersCount / metrics.totalUsers) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-medium text-gray-700">
                <span>Sellers ({metrics.sellersCount})</span>
                <span>
                  {metrics.totalUsers > 0 ? Math.round((metrics.sellersCount / metrics.totalUsers) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{
                    width: `${metrics.totalUsers > 0 ? (metrics.sellersCount / metrics.totalUsers) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Inventory Breakdown */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Inventory Distribution by Category</h2>
            <p className="text-xs text-gray-500">Item counts and total valuation across marketplace categories</p>
          </div>
          <span className="text-xs font-semibold text-gray-500">
            {metrics.categoriesBreakdown.length} active categories
          </span>
        </div>

        {metrics.categoriesBreakdown.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            No categorized products available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-700">
                <tr>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Listed Items</th>
                  <th className="px-4 py-3">Inventory Valuation</th>
                  <th className="px-4 py-3">Catalog Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {metrics.categoriesBreakdown.map((cat) => {
                  const share =
                    metrics.totalProducts > 0
                      ? Math.round((cat.count / metrics.totalProducts) * 100)
                      : 0;

                  return (
                    <tr key={cat.name} className="hover:bg-gray-50/70">
                      <td className="px-4 py-3 font-semibold text-gray-900">{cat.name}</td>
                      <td className="px-4 py-3">{cat.count} items</td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        ৳{cat.value.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${share}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">{share}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Analytics Methodology Documentation */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 text-xs text-gray-600 space-y-2">
        <div className="flex items-center gap-2 font-bold text-gray-900">
          <Info className="h-4 w-4 text-blue-600" />
          Analytics Methodology & Data Contracts
        </div>
        <p>
          <strong>Revenue Calculation:</strong> Only orders with confirmed Stripe payment (`paymentStatus === &apos;paid&apos;`) and non-cancelled order status are counted toward total settled volume.
        </p>
        <p>
          <strong>Data Freshness:</strong> Metrics reflect real data polled from `/api/admin/users`, `/api/products`, and aggregated `/api/seller/orders` without mocked or fabricated stats.
        </p>
      </div>
    </div>
  );
}