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
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/40",
      border: "hover:border-purple-300 dark:hover:border-purple-700/60",
      href: "/dashboard/admin/users",
    },
    {
      title: "Total Listings",
      value: totalProducts.toLocaleString(),
      icon: Package,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      border: "hover:border-amber-300 dark:hover:border-amber-700/60",
      href: "/dashboard/admin/products",
    },
    {
      title: "Marketplace Orders",
      value: totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/40",
      border: "hover:border-blue-300 dark:hover:border-blue-700/60",
      href: "/dashboard/admin/orders",
    },
    {
      title: "Settled Revenue",
      value: `৳${Number(totalRevenue).toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      border: "hover:border-emerald-300 dark:hover:border-emerald-700/60",
      href: "/dashboard/admin/analytics",
    },
  ];

  return (
    <section className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/40 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Platform Administration
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Admin Overview
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Real-time platform metrics synchronized with verified database collections.
          </p>
        </div>

        <Link
          href="/dashboard/admin/analytics"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition self-start sm:self-auto"
        >
          <BarChart3 className="w-4 h-4 text-emerald-400 dark:text-white" />
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
              className={`rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131b2e] p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${stat.border}`}
            >
              <div className="flex items-center justify-between">
                <div className={`rounded-xl p-3 ${stat.bg} ${stat.color}`}>
                  <Icon size={22} />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              </div>

              <div className="mt-4">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
                <h2 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {stat.value}
                </h2>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Administration Hub */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131b2e] p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">
          Administration Modules
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/dashboard/admin/users"
            className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-purple-200 dark:hover:border-purple-800/60 hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-purple-700 dark:group-hover:text-purple-300">
                User Management
              </span>
              <ExternalLink className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audit accounts, change roles, and toggle active/blocked status.
            </p>
          </Link>

          <Link
            href="/dashboard/admin/products"
            className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-amber-200 dark:hover:border-amber-800/60 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-amber-700 dark:group-hover:text-amber-300">
                Product Catalog
              </span>
              <ExternalLink className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-amber-600 dark:group-hover:text-amber-400" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Review marketplace listings, update statuses, or remove prohibited items.
            </p>
          </Link>

          <Link
            href="/dashboard/admin/orders"
            className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-blue-200 dark:hover:border-blue-800/60 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                Platform Orders
              </span>
              <ExternalLink className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track customer fulfillment status, delivery stages, and refunds.
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AdminOverviewPage;