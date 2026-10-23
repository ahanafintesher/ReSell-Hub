import Link from "next/link";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  ExternalLink,
} from "lucide-react";
import { getAdminStats } from "@/lib/actions/user";

const AdminOverviewPage = async () => {
  const statsData = await getAdminStats();

  const totalUsers = statsData.totalUsers ?? 0;
  const totalProducts = statsData.totalProducts ?? 0;
  const totalOrders = statsData.totalOrders ?? 0;
  const totalRevenue = statsData.totalRevenue ?? 0;

  const stats = [
    {
      title: "Registered Users",
      value: totalUsers.toLocaleString(),
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "hover:border-purple-300",
      href: "/dashboard/admin/users",
    },
    {
      title: "Total Listings",
      value: totalProducts.toLocaleString(),
      icon: Package,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "hover:border-amber-300",
      href: "/dashboard/admin/products",
    },
    {
      title: "Marketplace Orders",
      value: totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "hover:border-blue-300",
      href: "/dashboard/admin/orders",
    },
    {
      title: "Settled Revenue",
      value: `৳${Number(totalRevenue).toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "hover:border-emerald-300",
      href: "/dashboard/admin/analytics",
    },
  ];

  return (
    <section className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/50 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Platform Administration
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Admin Overview
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Real-time platform metrics synchronized with verified database collections.
          </p>
        </div>

        <Link
          href="/dashboard/admin/analytics"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition self-start sm:self-auto"
        >
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          Detailed Analytics
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Link
              key={stat.title}
              href={stat.href}
              className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${stat.border}`}
            >
              <div className="flex items-center justify-between">
                <div className={`rounded-xl p-3 ${stat.bg} ${stat.color}`}>
                  <Icon size={22} />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>

              <div className="mt-4">
                <p className="text-xs font-medium text-slate-500">{stat.title}</p>
                <h2 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {stat.value}
                </h2>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Administration Hub */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-4">
          Administration Modules
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/dashboard/admin/users"
            className="p-4 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/40 transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-900 group-hover:text-purple-700">
                User Management
              </span>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-purple-600" />
            </div>
            <p className="text-xs text-slate-500">
              Audit accounts, change roles, and toggle active/blocked status.
            </p>
          </Link>

          <Link
            href="/dashboard/admin/products"
            className="p-4 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/40 transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-900 group-hover:text-amber-700">
                Product Catalog
              </span>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
            </div>
            <p className="text-xs text-slate-500">
              Review marketplace listings, update statuses, or remove prohibited items.
            </p>
          </Link>

          <Link
            href="/dashboard/admin/orders"
            className="p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-900 group-hover:text-blue-700">
                Platform Orders
              </span>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
            </div>
            <p className="text-xs text-slate-500">
              Track customer fulfillment status, delivery stages, and refunds.
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AdminOverviewPage;