import { headers } from "next/headers";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  DollarSign,
  Clock3,
  ArrowRight,
  Truck,
  PackageCheck,
  CheckCircle2,
} from "lucide-react";

import { auth } from "@/lib/auth";
import { getOrdersBySellerInfo } from "@/lib/actions/orders";
import { getMyProducts } from "@/lib/actions/myProducts";
import { getSellerAnalytics } from "@/lib/actions/seller";

const SellerOverViewPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const sellerEmail = session?.user?.email;

  if (!sellerEmail) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">
          Please log in to view your dashboard.
        </p>
      </div>
    );
  }

  // Fetch orders, products, and analytics in parallel
  const [ordersRes, productsRes, analyticsRes] = await Promise.allSettled([
    getOrdersBySellerInfo(sellerEmail),
    getMyProducts(sellerEmail),
    getSellerAnalytics(sellerEmail),
  ]);

  const sellerOrders = ordersRes.status === "fulfilled" && Array.isArray(ordersRes.value)
    ? ordersRes.value
    : [];

  const sellerProducts = productsRes.status === "fulfilled" && Array.isArray(productsRes.value)
    ? productsRes.value
    : [];

  const analytics = analyticsRes.status === "fulfilled" ? analyticsRes.value : null;

  // Authoritative calculations matching requirements.md lines 436-445
  const totalProducts =
    analytics?.inventory?.total != null
      ? analytics.inventory.total
      : sellerProducts.length;

  const totalSales =
    analytics?.totalSales != null
      ? analytics.totalSales
      : sellerOrders.filter(
          (o) =>
            o.paymentStatus === "paid" &&
            o.orderStatus !== "cancelled" &&
            o.orderStatus !== "rejected"
        ).length;

  const totalRevenue =
    analytics?.totalRevenue != null
      ? analytics.totalRevenue
      : sellerOrders
          .filter(
            (o) =>
              o.paymentStatus === "paid" &&
              o.orderStatus !== "cancelled" &&
              o.orderStatus !== "rejected"
          )
          .reduce((sum, o) => sum + (Number(o.price) || 0), 0);

  const pendingOrders =
    analytics?.pendingOrders != null
      ? analytics.pendingOrders
      : sellerOrders.filter((o) => (o.orderStatus || "pending") === "pending").length;

  const recentOrders = [...sellerOrders]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    )
    .slice(0, 5);

  const stats = [
    {
      title: "Total Products",
      value: totalProducts,
      icon: Package,
      href: "/dashboard/seller/products/my-products",
      caption: "Listed in your store catalog",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/50",
    },
    {
      title: "Total Sales",
      value: totalSales,
      icon: ShoppingBag,
      href: "/dashboard/seller/orders",
      caption: "Completed buyer purchases",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/50",
    },
    {
      title: "Total Revenue",
      value: `৳${Number(totalRevenue).toLocaleString()}`,
      icon: DollarSign,
      href: "/dashboard/seller/analytics",
      caption: "Earnings from paid orders",
      color: "text-emerald-700 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/50",
    },
    {
      title: "Pending Orders",
      value: pendingOrders,
      icon: Clock3,
      href: "/dashboard/seller/orders",
      caption: "Orders waiting for action",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/50",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
          Welcome back, {session.user.name || "Seller"}!
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Here&apos;s an authoritative overview of your store performance and sales.
        </p>
      </div>

      {/* Required KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Link
              key={stat.title}
              href={stat.href}
              className="group rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#131b2e] p-5 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>

                <ArrowRight className="h-4 w-4 text-gray-400 dark:text-slate-500 transition group-hover:translate-x-1 group-hover:text-gray-700 dark:group-hover:text-slate-300" />
              </div>

              <div className="mt-5">
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                  {stat.title}
                </p>

                <p className="mt-1 text-3xl font-extrabold text-gray-900 dark:text-slate-100">
                  {stat.value}
                </p>

                <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
                  {stat.caption}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="mt-8 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#131b2e] shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
              Recent Customer Orders
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Your latest incoming buyer purchases
            </p>
          </div>

          <Link
            href="/dashboard/seller/orders"
            className="flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {recentOrders.map((order) => (
              <div
                key={order._id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div className="min-w-0">
                  <h3 className="truncate font-medium text-gray-900 dark:text-slate-100">
                    {order.productTitle || "Marketplace Product"}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                    Buyer: {order.buyerName || order.buyerInfo || "N/A"}
                  </p>

                  <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : "Date unavailable"}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <p className="font-semibold text-gray-900 dark:text-slate-100">
                    ৳{Number(order.price || 0).toLocaleString()}
                  </p>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium border capitalize ${
                      order.orderStatus === "delivered"
                        ? "bg-green-100 dark:bg-emerald-950/40 text-green-700 dark:text-emerald-300 border-green-200 dark:border-emerald-800/40"
                        : order.orderStatus === "rejected"
                          ? "bg-red-100 dark:bg-rose-950/40 text-red-700 dark:text-rose-300 border-red-200 dark:border-rose-800/40"
                          : order.orderStatus === "shipped"
                            ? "bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/40"
                            : order.orderStatus === "processing"
                              ? "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40"
                              : order.orderStatus === "accepted"
                                ? "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/40"
                                : "bg-yellow-100 dark:bg-amber-950/40 text-yellow-700 dark:text-amber-300 border-yellow-200 dark:border-amber-800/40"
                    }`}
                  >
                    {order.orderStatus || "Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-gray-400 dark:text-slate-500">
            No customer orders recorded yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerOverViewPage;
