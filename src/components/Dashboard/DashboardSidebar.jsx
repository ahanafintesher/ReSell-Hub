"use client";

import { Playfair_Display } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
import { Badge, Avatar } from "@heroui/react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import {
  ChartSpline,
  DollarSign,
  Heart,
  Package,
  ShoppingBag,
  ShoppingCart,
  LayoutDashboard,
  UserRound,
  UserRoundPen,
  Settings,
  LogOut,
  PlusCircle,
  Shield,
  Store,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";

const play = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const navMenu = {
  seller: [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard/seller/overview" },
    { icon: PlusCircle, label: "Add Product", href: "/dashboard/seller/products/add-products" },
    { icon: Package, label: "My Products", href: "/dashboard/seller/products/my-products" },
    { icon: ShoppingBag, label: "Manage Orders", href: "/dashboard/seller/orders" },
    { icon: ChartSpline, label: "Analytics", href: "/dashboard/seller/analytics" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ],
  buyer: [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard/buyer/overview" },
    { icon: ShoppingCart, label: "My Orders", href: "/dashboard/buyer/orders" },
    { icon: Heart, label: "Wishlist", href: "/dashboard/buyer/wishlist" },
    { icon: DollarSign, label: "Payment History", href: "/dashboard/buyer/payment-history" },
    { icon: UserRound, label: "Profile", href: "/dashboard/buyer/profile" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ],
  admin: [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard/admin/overview" },
    { icon: UserRoundPen, label: "Manage Users", href: "/dashboard/admin/users" },
    { icon: Package, label: "Manage Products", href: "/dashboard/admin/products" },
    { icon: ShoppingBag, label: "Manage Orders", href: "/dashboard/admin/orders" },
    { icon: ChartSpline, label: "Analytics", href: "/dashboard/admin/analytics" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ],
};

export function NavContent({ navItems = [], onNavigate }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1.5 px-2 py-2">
      {navItems.map((item) => {
        // Support nested routes (e.g. /dashboard/seller/products/add-products vs /dashboard/seller/products)
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" &&
            pathname.startsWith(item.href + "/"));

        const Icon = item.icon;

        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer ${
              isActive
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold border-l-4 border-emerald-600 dark:border-emerald-500 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <Icon
              className={`h-4 w-4 shrink-0 transition-colors ${
                isActive
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"
              }`}
            />
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge != null && (
              <Badge size="sm" color="primary" variant="flat">
                {item.badge}
              </Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export default function DashboardSidebar() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const role = user?.role || "buyer";
  const menu = navMenu[role] || [];

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/auth/login");
          router.refresh();
        },
      },
    });
  };

  const getRoleIcon = () => {
    if (role === "admin") return <Shield className="h-3 w-3 text-purple-600 dark:text-purple-400" />;
    if (role === "seller") return <Store className="h-3 w-3 text-amber-600 dark:text-amber-400" />;
    return <Sparkles className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />;
  };

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] lg:flex min-h-screen sticky top-0 h-screen transition-colors duration-200">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800/80">
        <Link href="/" className="group flex items-center gap-2 select-none">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-sm shadow-xs">
            R
          </span>
          <div>
            <h2 className={`${play.className} text-emerald-600 dark:text-emerald-400 text-xl font-extrabold tracking-tight group-hover:opacity-90 transition`}>
              ReSell Hub
            </h2>
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Second-Hand Market
            </p>
          </div>
        </Link>

        {/* User Card */}
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 p-2.5 border border-slate-200/60 dark:border-slate-800">
          <Avatar color="default" className="h-9 w-9 shrink-0">
            <Avatar.Image src={user?.image} alt={user?.name} />
            <Avatar.Fallback className="bg-emerald-600 text-white font-bold text-xs">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </Avatar.Fallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate capitalize">
              {user?.name || "Market User"}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate" title={user?.email}>
              {user?.email}
            </p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100/60 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/40">
                {getRoleIcon()}
                {role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-2">
        <div className="px-3 py-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2">
            Navigation
          </span>
        </div>
        <NavContent navItems={menu} />
      </div>

      {/* Bottom Footer Section: Sign Out */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
