
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
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session.user.name || "Seller"}!
        </h1>

        <p className="mt-1 text-sm text-gray-500">
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
              className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
                  <Icon className="h-5 w-5 text-gray-700" />
                </div>

                <ArrowRight className="h-4 w-4 text-gray-400 transition group-hover:translate-x-1 group-hover:text-gray-700" />
              </div>

              <div className="mt-5">
                <p className="text-sm text-gray-500">
                  {stat.title}
                </p>

                <p className="mt-1 text-3xl font-bold text-gray-900">
                  {stat.value}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="mt-8 rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Orders
            </h2>

            <p className="text-sm text-gray-500">
              Your latest customer orders
            </p>
          </div>

          <Link
            href="/dashboard/seller/orders"
            className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-black"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {recentOrders.map((order) => (
              <div
                key={order._id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <h3 className="truncate font-medium text-gray-900">
                    {order.productTitle}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Buyer: {order.buyerName || "N/A"}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : "Date unavailable"}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <p className="font-semibold text-gray-900">
                    ৳{Number(order.price || 0).toLocaleString()}
                  </p>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      order.orderStatus === "delivered"
                        ? "bg-green-100 text-green-700"
                        : order.orderStatus === "rejected"
                          ? "bg-red-100 text-red-700"
                          : order.orderStatus === "shipped"
                            ? "bg-purple-100 text-purple-700"
                            : order.orderStatus === "processing"
                              ? "bg-indigo-100 text-indigo-700"
                              : order.orderStatus === "accepted"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
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
            <ShoppingBag className="mx-auto h-10 w-10 text-gray-300" />

            <p className="mt-3 text-sm text-gray-500">
              No customer orders yet.
            </p>

            <Link
              href="/dashboard/seller/orders"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
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

