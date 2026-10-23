"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  PackageCheck,
  Package,
  Clock,
  Store,
  AlertCircle,
  PieChart as PieIcon,
  BarChart3,
  ArrowRight,
  Plus,
} from "lucide-react";
import { Button } from "@heroui/react";
import toast from "react-hot-toast";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

import { authClient } from "@/lib/auth-client";
import { getOrdersBySellerInfo } from "@/lib/actions/orders";
import { getMyProducts } from "@/lib/actions/myProducts";
import AnalyticsPageHeader from "@/components/Dashboard/AnalyticsPageHeader";
import AnalyticsKpiCard from "@/components/Dashboard/AnalyticsKpiCard";
import ChartCard from "@/components/Dashboard/ChartCard";
import CustomChartTooltip from "@/components/Dashboard/CustomChartTooltip";
import {
  formatBDT,
  aggregateOrdersTimeline,
  aggregateOrderStatusDistribution,
  aggregateSellerTopProducts,
} from "@/lib/analyticsUtils";

export default function SellerAnalyticsPage() {
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const sellerEmail = session?.user?.email;

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadSellerData = async (email) => {
    if (!email) return;

    try {
      const results = await Promise.allSettled([
        getOrdersBySellerInfo(email),
        getMyProducts(email),
      ]);

      const [ordersRes, productsRes] = results;
      const failures = [];

      if (ordersRes.status === "fulfilled") {
        setOrders(Array.isArray(ordersRes.value) ? ordersRes.value : []);
      } else {
        failures.push("Customer orders");
        console.warn("Seller analytics orders error:", ordersRes.reason);
      }

      if (productsRes.status === "fulfilled") {
        setProducts(Array.isArray(productsRes.value) ? productsRes.value : []);
      } else {
        failures.push("Store inventory");
        console.warn("Seller analytics products error:", productsRes.reason);
      }

      if (failures.length > 0) {
        setError(`Unable to fully synchronize: ${failures.join(", ")}. Verify your seller session.`);
      } else {
        setError(null);
      }

      setLastUpdated(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
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
    toast.success("Store metrics refreshed");
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
        const results = await Promise.allSettled([
          getOrdersBySellerInfo(sellerEmail),
          getMyProducts(sellerEmail),
        ]);

        if (ignore) return;

        const [ordersRes, productsRes] = results;
        const failures = [];

        if (ordersRes.status === "fulfilled") {
          setOrders(Array.isArray(ordersRes.value) ? ordersRes.value : []);
        } else {
          failures.push("Customer orders");
        }

        if (productsRes.status === "fulfilled") {
          setProducts(Array.isArray(productsRes.value) ? productsRes.value : []);
        } else {
          failures.push("Store listings");
        }

        if (failures.length > 0) {
          setError(`Unable to fully synchronize: ${failures.join(", ")}.`);
        } else {
          setError(null);
        }

        setLastUpdated(
          new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })
        );
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

  // Compute metrics from actual seller data only
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

    const avgOrderValue =
      validPaidOrders.length > 0
        ? Math.round(totalRevenue / validPaidOrders.length)
        : 0;

    // Chart Aggregations
    const revenueTimeline = aggregateOrdersTimeline(orders);
    const orderStatusDist = aggregateOrderStatusDistribution(orders);
    const topProducts = aggregateSellerTopProducts(orders);

    const hasRevenueData = revenueTimeline.some((p) => p.revenue > 0);
    const hasStatusData = orderStatusDist.some((s) => s.value > 0);
    const hasProductData = topProducts.length > 0;

    return {
      totalProducts,
      availableProducts,
      totalInventoryValue,
      totalOrders,
      totalRevenue,
      completedSales,
      pendingOrders,
      avgOrderValue,
      revenueTimeline,
      orderStatusDist,
      topProducts,
      hasRevenueData,
      hasStatusData,
      hasProductData,
    };
  }, [orders, products]);

  if (sessionLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-emerald-600 border-t-transparent" />
          <p className="mt-4 text-sm font-medium text-gray-600">
            Authenticating seller account...
          </p>
        </div>
      </div>
    );
  }

  if (!sellerEmail) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
          <Store className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-gray-900">
          Seller Authentication Required
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 leading-relaxed">
          Please log in with your verified seller credentials to access real store metrics, orders flow, and earnings data.
        </p>
        <Link href="/auth/login" className="mt-6 inline-block">
          <Button color="primary" className="bg-emerald-600 text-white font-semibold px-6 py-2.5">
            Log In as Seller
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      {/* Header */}
      <AnalyticsPageHeader
        badgeIcon={TrendingUp}
        badgeText="Store Performance"
        badgeVariant="green"
        title="Seller Analytics"
        subtitle={`Real performance metrics and sales trends for ${sellerEmail}`}
        onRefresh={handleRefresh}
        refreshing={loading}
        lastUpdated={lastUpdated}
        actions={
          <Link href="/dashboard/seller/products/add-products">
            <Button
              color="primary"
              size="sm"
              startContent={<Plus className="h-4 w-4" />}
              className="bg-emerald-600 text-white font-semibold shadow-xs hover:bg-emerald-700"
            >
              Add Product
            </Button>
          </Link>
        }
      />

      {/* Error State */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-xs">
          <AlertCircle className="mt-0.5 h-5 w-5 text-red-600 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Sync Notice</p>
            <p className="mt-0.5 text-xs text-red-700">{error}</p>
          </div>
          <Button
            size="sm"
            color="danger"
            variant="flat"
            onPress={() => loadSellerData(sellerEmail)}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Top Level KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Settled Revenue */}
        <AnalyticsKpiCard
          title="Earned Revenue"
          value={formatBDT(metrics.totalRevenue)}
          subtext={`Avg Order: ${formatBDT(metrics.avgOrderValue)}`}
          icon={DollarSign}
          colorScheme="green"
          loading={loading}
        />

        {/* Completed Sales */}
        <AnalyticsKpiCard
          title="Completed Sales"
          value={metrics.completedSales.toLocaleString()}
          subtext={
            metrics.totalOrders > 0
              ? `${Math.round(
                  (metrics.completedSales / metrics.totalOrders) * 100
                )}% fulfillment rate`
              : "0 total orders"
          }
          icon={PackageCheck}
          colorScheme="blue"
          loading={loading}
        />

        {/* Action Needed */}
        <AnalyticsKpiCard
          title="Action Needed"
          value={metrics.pendingOrders.toLocaleString()}
          subtext="Pending customer orders"
          icon={Clock}
          colorScheme="amber"
          loading={loading}
        />

        {/* Active Inventory */}
        <AnalyticsKpiCard
          title="Active Listings"
          value={metrics.totalProducts.toLocaleString()}
          subtext={`${formatBDT(metrics.totalInventoryValue)} inventory valuation`}
          icon={Package}
          colorScheme="purple"
          loading={loading}
        />
      </div>

      {/* Overall Empty State if no products and no orders */}
      {!loading && products.length === 0 && orders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4">
            <Store className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            No listings yet in your store
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 leading-relaxed">
            Start listing pre-owned electronics, furniture, or accessories to generate sales and unlock interactive performance analytics.
          </p>
          <div className="mt-6 flex justify-center">
            <Link href="/dashboard/seller/products/add-products">
              <Button
                color="primary"
                className="bg-emerald-600 text-white font-semibold px-6 py-2.5 shadow-sm hover:bg-emerald-700"
              >
                List Your First Product
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Row 1: Sales Revenue Trend & Orders by Status */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Chart 1: Sales / Revenue Trend (Area Chart) */}
            <ChartCard
              title="Sales & Revenue Trend"
              subtitle="Confirmed customer earnings grouped chronologically by order date (BDT)"
              badge="Confirmed Paid"
              loading={loading}
              isEmpty={!metrics.hasRevenueData}
              emptyIcon={TrendingUp}
              emptyTitle="No Paid Sales Yet"
              emptyDescription="Confirmed revenue will plot chronologically as customers place and pay for orders."
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={metrics.revenueTimeline}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="sellerRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="formattedDate"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#e2e8f0" }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) =>
                      val >= 1000 ? `৳${(val / 1000).toFixed(0)}k` : `৳${val}`
                    }
                  />
                  <Tooltip
                    content={
                      <CustomChartTooltip
                        isCurrency={true}
                        labelPrefix="Date: "
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Earned Revenue"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#sellerRevenueGrad)"
                    activeDot={{ r: 6, fill: "#059669", stroke: "#ffffff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Chart 2: Orders by Status (Donut Chart) */}
            <ChartCard
              title="Orders by Delivery Status"
              subtitle="Breakdown of customer orders across fulfillment milestones"
              badge={`${metrics.totalOrders} Orders`}
              loading={loading}
              isEmpty={!metrics.hasStatusData}
              emptyIcon={PieIcon}
              emptyTitle="No Orders Received"
              emptyDescription="As customers order your items, fulfillment stage proportions will show here."
            >
              <div className="flex flex-col sm:flex-row items-center justify-between h-full w-full gap-4">
                <div className="w-full sm:w-3/5 h-[230px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metrics.orderStatusDist}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                      >
                        {metrics.orderStatusDist.map((entry) => (
                          <Cell
                            key={`seller-status-${entry.status}`}
                            fill={entry.color}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={
                          <CustomChartTooltip valueSuffix=" orders" />
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Status Breakdown Legend & Counts */}
                <div className="w-full sm:w-2/5 space-y-2 text-xs pr-2">
                  {metrics.orderStatusDist.map((st) => (
                    <div
                      key={st.status}
                      className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: st.color }}
                        />
                        <span className="font-medium text-gray-700">{st.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-bold text-gray-900">
                        <span>{st.value}</span>
                        <span className="text-gray-400 font-normal">
                          ({st.percentage}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ChartCard>
          </div>

          {/* Row 2: Top Products Ranked by Settled Revenue (Horizontal Bar Chart) */}
          <ChartCard
            title="Top Products by Settled Revenue"
            subtitle="Best-selling items in your catalog ranked by confirmed earned revenue (BDT)"
            badge={`${metrics.topProducts.length} Items Ordered`}
            loading={loading}
            isEmpty={!metrics.hasProductData}
            emptyIcon={BarChart3}
            emptyTitle="No Sales by Product"
            emptyDescription="Product ranking will display once buyers purchase your listed items."
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={metrics.topProducts.slice(0, 6)}
                margin={{ top: 5, right: 30, left: 15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickFormatter={(val) =>
                    val >= 1000 ? `৳${(val / 1000).toFixed(0)}k` : `৳${val}`
                  }
                />
                <YAxis
                  dataKey="shortTitle"
                  type="category"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={120}
                />
                <Tooltip
                  content={
                    <CustomChartTooltip
                      isCurrency={true}
                      labelPrefix="Product: "
                    />
                  }
                />
                <Bar
                  dataKey="revenue"
                  name="Settled Revenue"
                  fill="#10b981"
                  radius={[0, 6, 6, 0]}
                  maxBarSize={22}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Row 3: Product Performance Breakdown Table */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
            <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Product Sales Performance Breakdown
                </h2>
                <p className="text-xs text-gray-500">
                  Order counts, paid sales conversion, and settled earnings per listing
                </p>
              </div>
              <Link
                href="/dashboard/seller/products/my-products"
                className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1"
              >
                View all inventory
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {metrics.topProducts.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-400">
                No orders recorded yet. As customers buy items, detailed item performance will appear here.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-700">
                    <tr>
                      <th className="px-4 py-3">Rank & Product</th>
                      <th className="px-4 py-3">Total Orders</th>
                      <th className="px-4 py-3">Paid Orders</th>
                      <th className="px-4 py-3">Earned Revenue</th>
                      <th className="px-4 py-3 text-right">Avg Item Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {metrics.topProducts.slice(0, 8).map((item, index) => {
                      const avgPrice =
                        item.paidOrdersCount > 0
                          ? Math.round(item.revenue / item.paidOrdersCount)
                          : 0;

                      return (
                        <tr key={item.id + index} className="hover:bg-gray-50/70">
                          <td className="px-4 py-3 font-semibold text-gray-900">
                            <div className="flex items-center gap-2.5">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700 border border-emerald-100">
                                {index + 1}
                              </span>
                              <span className="truncate max-w-xs">{item.title}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">{item.ordersCount} orders</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                              {item.paidOrdersCount} paid
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold text-gray-900">
                            {formatBDT(item.revenue)}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-gray-700">
                            {formatBDT(avgPrice)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Quick Action Navigation */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-gray-900 text-base">
            Ready to fulfill pending orders?
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Advance fulfillment steps (Accept, Process, Ship, Deliver) directly on the manage orders dashboard.
          </p>
        </div>
        <Link href="/dashboard/seller/orders">
          <Button
            color="primary"
            className="bg-black text-white font-medium hover:bg-gray-800 transition"
          >
            Manage Customer Orders
          </Button>
        </Link>
      </div>
    </div>
  );
}