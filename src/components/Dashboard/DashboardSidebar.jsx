"use client";
import { Bars } from "@gravity-ui/icons";
import { Playfair_Display } from "next/font/google";
import { CirclePlus } from "@gravity-ui/icons";
import { usePathname } from "next/navigation";
import { Badge, Button, Drawer } from "@heroui/react";
import { authClient } from "@/lib/auth-client";
import { Avatar } from "@heroui/react";
import Link from "next/link";
import {
  ChartSpline,
  DollarSign,
  Heart,
  Package,
  ShoppingBag,
  ShoppingCart,
  Summary,
  UserRound,
  UserRoundPen,
} from "lucide-react";

const play = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const navMenu = {
  seller: [
    { icon: Summary, label: "Overview", href: "/dashboard/seller/overview" },
    { icon: CirclePlus, label: "Add Product", href: "/dashboard/seller/products/add-products" },
    { icon: Package, label: "My Products", href: "/dashboard/seller/products/my-products" },
    { icon: ShoppingBag, label: "Manage Orders", href: "/dashboard/seller/orders" },
    { icon: ChartSpline, label: "Analytics", href: "/dashboard/seller/analytics" },
  ],
  buyer: [
    { icon: Summary, label: "Overview", href: "/dashboard/buyer/overview" },
    { icon: ShoppingCart, label: "My Orders", href: "/dashboard/buyer/orders" },
    { icon: Heart, label: "Wishlist", href: "/dashboard/buyer/wishlist" },
    { icon: DollarSign, label: "Payment History", href: "/dashboard/buyer/payment-history" },
    { icon: UserRound, label: "Profile", href: "/dashboard/buyer/profile" },
  ],
  admin: [
    { icon: Summary, label: "Overview", href: "/dashboard/admin/overview" },
    { icon: UserRoundPen, label: "Manage Users", href: "/dashboard/admin/users" },
    { icon: Package, label: "Manage Products", href: "/dashboard/admin/products" },
    { icon: ShoppingBag, label: "Manage Orders", href: "/dashboard/admin/orders" },
    { icon: ChartSpline, label: "Analytics", href: "/dashboard/admin/analytics" },
  ],
};

export function NavContent({ navItems = [] }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1 px-1 py-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={[
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-emerald-50 text-emerald-800 font-semibold border-l-4 border-emerald-600"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            ].join(" ")}
          >
            <item.icon
              className={[
                "size-4 shrink-0 transition-colors",
                isActive ? "text-emerald-700" : "text-slate-400 group-hover:text-slate-600",
              ].join(" ")}
            />
            <span className="flex-1">{item.label}</span>
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
  const { data: session } = authClient.useSession();
  const role = session?.user?.role || "buyer";
  const menu = navMenu[role] || [];

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
      <div className="p-5 border-b border-slate-100">
        <h2 className={`${play.className} text-emerald-600 text-2xl font-extrabold`}>ReSell Hub</h2>
        <p className="mt-0.5 text-xs font-semibold text-slate-500 capitalize">{role} Dashboard</p>
        <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
          <Avatar color="default" className="size-10 shrink-0">
            <Avatar.Image src={session?.user?.image} alt={session?.user?.name} />
            <Avatar.Fallback className="bg-emerald-600 text-white font-bold">
              {session?.user?.name?.charAt(0).toUpperCase() || "U"}
            </Avatar.Fallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm capitalize text-slate-800 truncate">
              {session?.user?.name || "User"}
            </p>
            <p className="text-xs text-slate-500 truncate" title={session?.user?.email}>
              {session?.user?.email}
            </p>
            <span className="inline-block mt-0.5 text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
              {role}
            </span>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <NavContent navItems={menu} />
      </div>
    </aside>
  );
}
