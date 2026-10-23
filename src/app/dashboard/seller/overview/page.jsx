
import { headers } from "next/headers";
import Link from "next/link";
import {
  ShoppingBag,
  Clock3,
  Truck,
  PackageCheck,
  ArrowRight,
} from "lucide-react";

import { auth } from "@/lib/auth";
import { getOrdersBySellerInfo } from "@/lib/actions/orders";

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

  const orders = await getOrdersBySellerInfo(sellerEmail);

  const sellerOrders = Array.isArray(orders) ? orders : [];

  const totalOrders = sellerOrders.length;

  const pendingOrders = sellerOrders.filter(
    (order) => order.orderStatus === "pending",
  ).length;

  const processingOrders = sellerOrders.filter(
    (order) => order.orderStatus === "processing",
  ).length;

  const deliveredOrders = sellerOrders.filter(
    (order) => order.orderStatus === "delivered",
  ).length;

  const recentOrders = [...sellerOrders]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  const stats = [
    {
      title: "Total Orders",
      value: totalOrders,
      icon: ShoppingBag,
      href: "/dashboard/seller/orders",
    },
    {
      title: "Pending Orders",
      value: pendingOrders,
      icon: Clock3,
      href: "/dashboard/seller/orders",
    },
    {
      title: "Processing",
      value: processingOrders,
      icon: Truck,
      href: "/dashboard/seller/orders",
    },
    {
      title: "Delivered",
      value: deliveredOrders,
      icon: PackageCheck,
      href: "/dashboard/seller/orders",
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
          Here&apos;s an overview of your store activity.
        </p>
      </div>

      {/* Stats */}
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
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 dark:bg-slate-800">
                  <Icon className="h-5 w-5 text-gray-700 dark:text-slate-300" />
                </div>

                <ArrowRight className="h-4 w-4 text-gray-400 dark:text-slate-500 transition group-hover:translate-x-1 group-hover:text-gray-700 dark:group-hover:text-slate-300" />
              </div>

              <div className="mt-5">
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  {stat.title}
                </p>

                <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-slate-100">
                  {stat.value}
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
              Recent Orders
            </h2>

            <p className="text-sm text-gray-500 dark:text-slate-400">
              Your latest customer orders
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
                    {order.productTitle}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                    Buyer: {order.buyerName || "N/A"}
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
                    className={`rounded-full px-3 py-1 text-xs font-medium border ${
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
                    {order.orderStatus
                      ? order.orderStatus.charAt(0).toUpperCase() +
                        order.orderStatus.slice(1)
                      : "Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-12 text-center">
            <ShoppingBag className="mx-auto h-10 w-10 text-gray-300 dark:text-slate-600" />

            <p className="mt-3 text-sm text-gray-500 dark:text-slate-400">
              No customer orders yet.
            </p>

            <Link
              href="/dashboard/seller/orders"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white transition shadow-xs"
            >
              Manage Orders
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerOverViewPage;

