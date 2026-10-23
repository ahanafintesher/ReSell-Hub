"use client";

import { useEffect, useState, useMemo } from "react";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  AlertCircle,
  BarChart3,
  PieChart as PieIcon,
  Layers,
  ShieldCheck,
  TrendingUp,
  Info,
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

import { getAdminUsers } from "@/lib/actions/user";
import { getProducts } from "@/lib/actions/getProducts";
import { getAdminOrders } from "@/lib/actions/orders";
import AnalyticsPageHeader from "@/components/Dashboard/AnalyticsPageHeader";
import AnalyticsKpiCard from "@/components/Dashboard/AnalyticsKpiCard";
import ChartCard from "@/components/Dashboard/ChartCard";
import CustomChartTooltip from "@/components/Dashboard/CustomChartTooltip";
import {
  formatBDT,
  aggregateOrdersTimeline,
  aggregateOrderStatusDistribution,
  aggregateCategoryDistribution,
  aggregateUserRoleDistribution,
} from "@/lib/analyticsUtils";
import { useTheme } from "@/components/Theme/ThemeProvider";

export default function AdminAnalyticsPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const gridStroke = isDark ? "#223049" : "#f1f5f9";
  const axisStroke = isDark ? "#64748b" : "#94a3b8";
  const lineStroke = isDark ? "#334155" : "#e2e8f0";

  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadData = async () => {
    try {
      const results = await Promise.allSettled([
        getAdminUsers(),
        getProducts(),
        getAdminOrders(),
      ]);

      const [usersRes, productsRes, ordersRes] = results;
      const failures = [];

      if (usersRes.status === "fulfilled") {
        setUsers(Array.isArray(usersRes.value) ? usersRes.value : []);
      } else {
        failures.push("Users directory");
        console.warn("Analytics users error:", usersRes.reason);
      }

      if (productsRes.status === "fulfilled") {
        setProducts(Array.isArray(productsRes.value) ? productsRes.value : []);
      } else {
        failures.push("Product inventory");
        console.warn("Analytics products error:", productsRes.reason);
      }

      if (ordersRes.status === "fulfilled") {
        setOrders(Array.isArray(ordersRes.value) ? ordersRes.value : []);
      } else {
        failures.push("Platform orders");
        console.warn("Analytics orders error:", ordersRes.reason);
      }

      if (failures.length > 0) {
        setError(`Unable to fully retrieve: ${failures.join(", ")}. Verify your admin authorization.`);
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
      console.error("Failed to load platform analytics:", err);
      setError(err.message || "Failed to load platform analytics.");
      toast.error(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await loadData();
    toast.success("Analytics metrics refreshed");
  };

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const results = await Promise.allSettled([
          getAdminUsers(),
          getProducts(),
          getAdminOrders(),
        ]);

        if (ignore) return;

        const [usersRes, productsRes, ordersRes] = results;
        const failures = [];

        if (usersRes.status === "fulfilled") {
          setUsers(Array.isArray(usersRes.value) ? usersRes.value : []);
        } else {
          failures.push("Users directory");
        }

        if (productsRes.status === "fulfilled") {
          setProducts(Array.isArray(productsRes.value) ? productsRes.value : []);
        } else {
          failures.push("Product inventory");
        }

        if (ordersRes.status === "fulfilled") {
          setOrders(Array.isArray(ordersRes.value) ? ordersRes.value : []);
        } else {
          failures.push("Platform orders");
        }

        if (failures.length > 0) {
          setError(`Unable to fully retrieve: ${failures.join(", ")}. Verify your admin permissions.`);
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

    // Aggregations for Charts
    const revenueTimeline = aggregateOrdersTimeline(orders);
    const orderStatusDist = aggregateOrderStatusDistribution(orders);
    const categoriesDist = aggregateCategoryDistribution(products);
    const userRoleDist = aggregateUserRoleDistribution(users);

    const hasRevenueData = revenueTimeline.some((point) => point.revenue > 0);
    const hasOrderTimelineData = revenueTimeline.some((point) => point.totalOrders > 0);
    const hasStatusData = orderStatusDist.some((stage) => stage.value > 0);
    const hasCategoryData = categoriesDist.length > 0;
    const hasUserData = userRoleDist.total > 0;

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
      revenueTimeline,
      orderStatusDist,
      categoriesDist,
      userRoleDist,
      hasRevenueData,
      hasOrderTimelineData,
      hasStatusData,
      hasCategoryData,
      hasUserData,
    };
  }, [users, products, orders]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      {/* Header */}
      <AnalyticsPageHeader
        badgeIcon={BarChart3}
        badgeText="Live Marketplace Intelligence"
        badgeVariant="blue"
        title="Platform Analytics"
        subtitle="Real-time business insights aggregated across live MongoDB collections."
        onRefresh={handleRefresh}
        refreshing={loading}
        lastUpdated={lastUpdated}
      />

      {/* Error Banner */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-xs">
          <AlertCircle className="mt-0.5 h-5 w-5 text-red-600 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Analytics Sync Notice</p>
            <p className="mt-0.5 text-xs text-red-700">{error}</p>
          </div>
          <Button size="sm" color="danger" variant="flat" onPress={loadData}>
            Retry Sync
          </Button>
        </div>
      )}

      {/* Top Level KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Settled Revenue */}
        <AnalyticsKpiCard
          title="Settled Volume"
          value={formatBDT(metrics.totalRevenue)}
          subtext={`Avg Order: ${formatBDT(metrics.avgOrderValue)}`}
          icon={DollarSign}
          colorScheme="green"
          loading={loading}
        />

        {/* Total Orders */}
        <AnalyticsKpiCard
          title="Total Orders"
          value={metrics.totalOrders.toLocaleString()}
          subtext={`${metrics.completedOrders} delivered (${
            metrics.totalOrders > 0
              ? Math.round((metrics.completedOrders / metrics.totalOrders) * 100)
              : 0
          }%)`}
          icon={ShoppingBag}
          colorScheme="blue"
          loading={loading}
        />

        {/* Registered Users */}
        <AnalyticsKpiCard
          title="Registered Users"
          value={metrics.totalUsers.toLocaleString()}
          subtext={`${metrics.sellersCount} sellers · ${metrics.buyersCount} buyers`}
          icon={Users}
          colorScheme="purple"
          loading={loading}
        />

        {/* Active Inventory */}
        <AnalyticsKpiCard
          title="Active Listings"
          value={metrics.availableProducts.toLocaleString()}
          subtext={`${formatBDT(metrics.totalInventoryValue)} total valuation`}
          icon={Package}
          colorScheme="amber"
          loading={loading}
        />
      </div>

      {/* Row 1: Revenue Trend & Orders Overview Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart 1: Revenue Trend (Area Chart) */}
        <ChartCard
          title="Revenue Trend"
          subtitle="Confirmed paid volume aggregated chronologically by order date (BDT)"
          badge="Confirmed Paid"
          loading={loading}
          isEmpty={!metrics.hasRevenueData}
          emptyIcon={TrendingUp}
          emptyTitle="No Paid Revenue Yet"
          emptyDescription="As soon as buyers complete Stripe checkout for product listings, confirmed earnings will plot here."
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={metrics.revenueTimeline}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id="adminRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis
                dataKey="formattedDate"
                stroke={axisStroke}
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: lineStroke }}
              />
              <YAxis
                stroke={axisStroke}
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
                name="Settled Revenue"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#adminRevenueGrad)"
                activeDot={{ r: 6, fill: "#059669", stroke: "#ffffff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 2: Orders Overview (Bar Chart) */}
        <ChartCard
          title="Orders Overview"
          subtitle="Inbound order volume and completed deliveries grouped by date"
          badge="Activity"
          loading={loading}
          isEmpty={!metrics.hasOrderTimelineData}
          emptyIcon={ShoppingBag}
          emptyTitle="No Inbound Orders"
          emptyDescription="Daily order transactions placed by marketplace buyers will be charted over time here."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={metrics.revenueTimeline}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis
                dataKey="formattedDate"
                stroke={axisStroke}
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: lineStroke }}
              />
              <YAxis
                stroke={axisStroke}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />
              <Bar
                dataKey="totalOrders"
                name="Total Orders"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
              <Bar
                dataKey="deliveredOrders"
                name="Delivered"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 2: Order Status Distribution & User Demographics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart 3: Order Status Distribution (Donut Chart) */}
        <ChartCard
          title="Order Fulfillment Distribution"
          subtitle="Proportion of orders across fulfillment stages (Delivered, Shipped, Pending, etc.)"
          badge={`${metrics.totalOrders} Total`}
          loading={loading}
          isEmpty={!metrics.hasStatusData}
          emptyIcon={PieIcon}
          emptyTitle="No Orders to Classify"
          emptyDescription="Order lifecycle status distributions will display as soon as orders are submitted."
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
                      <Cell key={`status-cell-${entry.status}`} fill={entry.color} />
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

            {/* Quick status list */}
            <div className="w-full sm:w-2/5 space-y-2 text-xs pr-2">
              {metrics.orderStatusDist.map((st) => (
                <div
                  key={st.status}
                  className="flex items-center justify-between py-1 border-b border-gray-100 dark:border-slate-800 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: st.color }}
                    />
                    <span className="font-medium text-gray-700 dark:text-slate-300">{st.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-slate-100">
                    <span>{st.value}</span>
                    <span className="text-gray-400 dark:text-slate-500 font-normal">
                      ({st.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Chart 4: User Demographics & Roles (Donut Chart) */}
        <ChartCard
          title="User Role Distribution"
          subtitle="Participant mix across buyers, sellers, and administrators with account health"
          badge={`${metrics.totalUsers} Registered`}
          loading={loading}
          isEmpty={!metrics.hasUserData}
          emptyIcon={Users}
          emptyTitle="No Users Found"
          emptyDescription="Platform participants will be visualised here as users register on ReSell Hub."
        >
          <div className="flex flex-col sm:flex-row items-center justify-between h-full w-full gap-4">
            <div className="w-full sm:w-3/5 h-[230px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.userRoleDist.roles}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {metrics.userRoleDist.roles.map((entry) => (
                      <Cell key={`role-cell-${entry.role}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={
                      <CustomChartTooltip valueSuffix=" accounts" />
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* User Moderation Status Box */}
            <div className="w-full sm:w-2/5 space-y-2.5 text-xs pr-2">
              <div className="rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-900/60 p-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-600 dark:text-slate-400">Active Accounts</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    {metrics.activeUsers}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-gray-400 dark:text-slate-500">
                  {metrics.totalUsers > 0
                    ? Math.round((metrics.activeUsers / metrics.totalUsers) * 100)
                    : 100}
                  % in good standing
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-900/60 p-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-600 dark:text-slate-400">Restricted / Blocked</span>
                  <span className="font-bold text-rose-700 dark:text-rose-400">
                    {metrics.blockedUsers}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-gray-400 dark:text-slate-500">
                  {metrics.totalUsers > 0
                    ? Math.round((metrics.blockedUsers / metrics.totalUsers) * 100)
                    : 0}
                  % moderated
                </p>
              </div>

              <div className="pt-1 space-y-1">
                {metrics.userRoleDist.roles.map((r) => (
                  <div
                    key={r.role}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: r.color }}
                      />
                      <span className="text-gray-600 dark:text-slate-400">{r.name}</span>
                    </div>
                    <span className="font-semibold text-gray-800 dark:text-slate-200">
                      {r.value} ({r.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Row 3: Marketplace Categories (Horizontal Bar Chart) */}
      <ChartCard
        title="Marketplace Categories"
        subtitle="Catalog depth and product volume across classified categories"
        badge={`${metrics.categoriesDist.length} Categories`}
        loading={loading}
        isEmpty={!metrics.hasCategoryData}
        emptyIcon={Layers}
        emptyTitle="No Listed Products"
        emptyDescription="When sellers list items in categories like Electronics, Furniture, or Fashion, counts appear here."
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={metrics.categoriesDist.slice(0, 8)}
            margin={{ top: 5, right: 30, left: 15, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
            <XAxis
              type="number"
              stroke={axisStroke}
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: lineStroke }}
              allowDecimals={false}
            />
            <YAxis
              dataKey="category"
              type="category"
              stroke={isDark ? "#94a3b8" : "#64748b"}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={110}
            />
            <Tooltip
              content={
                <CustomChartTooltip valueSuffix=" active items" />
              }
            />
            <Bar
              dataKey="count"
              name="Listed Items"
              fill="#059669"
              radius={[0, 6, 6, 0]}
              maxBarSize={22}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Detailed Category Inventory Table */}
      <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#131b2e] p-6 shadow-xs">
        <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-slate-100">
              Inventory Valuation by Category
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Breakdown of product volume, cumulative asking valuation, and market share
            </p>
          </div>
          <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">
            {metrics.categoriesDist.length} active categories
          </span>
        </div>

        {metrics.categoriesDist.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400 dark:text-slate-500">
            No categorized products available in the database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-slate-300">
              <thead className="border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/60 text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Listed Items</th>
                  <th className="px-4 py-3">Inventory Valuation</th>
                  <th className="px-4 py-3">Catalog Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {metrics.categoriesDist.map((cat) => {
                  return (
                    <tr key={cat.category} className="hover:bg-gray-50/70 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-slate-100">
                        {cat.category}
                      </td>
                      <td className="px-4 py-3">{cat.count} items</td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-slate-100">
                        {formatBDT(cat.value)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                              style={{ width: `${cat.percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 dark:text-slate-400">
                            {cat.percentage}%
                          </span>
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
      <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-gray-50/90 dark:bg-slate-900/60 p-5 text-xs text-gray-600 dark:text-slate-300 space-y-2 shadow-xs">
        <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-slate-100">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          Analytics Methodology & Data Governance
        </div>
        <p>
          <strong>Settled Revenue Principle:</strong> Earned revenue counts only orders with confirmed Stripe payment (`paymentStatus === &apos;paid&apos;`) and excludes rejected or cancelled orders. Inventory asking valuation represents active catalog pricing, not earned proceeds.
        </p>
        <p>
          <strong>Real-Time Aggregation:</strong> Metrics are derived directly from authenticated queries against `/api/admin/users`, `/api/products`, and deduplicated `/api/seller/orders` / `/api/buyer/orders` endpoints without fabricated dates or synthetic data.
        </p>
      </div>
    </div>
  );
}