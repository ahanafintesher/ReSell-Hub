"use client";
import { Bars } from "@gravity-ui/icons";

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

const navMenu = {
  seller: [
    {
      icon: Summary,
      label: "Overview",
      href: "/dashboard/seller/overview",
    },
    {
      icon: CirclePlus,
      label: "Add Product",
      href: "/dashboard/seller/products/add-products",
    },
    {
      icon: Package,
      label: "My Products",
      href: "/dashboard/seller/products/my-products",
    },
    {
      icon: ShoppingBag,
      label: "Manage Orders",
      href: "/dashboard/seller/orders",
    },
    {
      icon: ChartSpline,
      label: "Analytics",
      href: "/dashboard/seller/analytics",
    },
  ],

  buyer: [
    {
      icon: Summary,
      label: "Overview",
      href: "/dashboard/buyer",
    },
    {
      icon: ShoppingCart,
      label: "My Orders",
      href: "/dashboard/buyer/orders",
    },
    {
      icon: Heart,
      label: "Wishlist",
      href: "/dashboard/buyer/orders",
    },
    {
      icon: DollarSign,
      label: "Payment History",
      href: "/dashboard/buyer/orders",
    },
    {
      icon: UserRound,
      label: "Profile",
      href: "/dashboard/buyer/orders",
    },
  ],

  admin: [
    {
      icon: Summary,
      label: "Overview",
      href: "/dashboard/admin",
    },
    {
      icon: UserRoundPen,
      label: "Manage Users",
      href: "/dashboard/admin/users",
    },
    {
      icon: Package,
      label: "Manage Products",
      href: "/dashboard/admin/users",
    },
    {
      icon: ShoppingBag,
      label: "Manage Orders",
      href: "/dashboard/seller/products/add_products",
    },
    {
      icon: ChartSpline,
      label: "Analytics",
      href: "/dashboard/seller/products/add_products",
    },
  ],
};

function NavContent({ navItems }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5 px-2 py-2.5">
      {navItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={[
              "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-semibold transition-colors",
              isActive
                ? "bg-green-300 text-white"
                : "text-default-600 hover:bg-green-300 hover:text-white",
            ].join(" ")}
          >
            <item.icon
              className={[
                "size-[18px] shrink-0",
                isActive ? "text-white" : "text-default-500",
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
  const { data: session, error } = authClient.useSession();
  const role = session?.user?.role;
  const menu = navMenu[role] || [];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r lg:flex">
        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-bold text-slate-800">ReSell Hub</h2>

          <p className="mt-1 text-sm font-semibold text-slate-500 capitalize">
            {session?.user?.role} Dashboard
          </p>

          <div className="mt-5 flex items-center gap-3 border-t pt-4">
            <Avatar color="default" className="size-10">
              <Avatar.Image
                src={session?.user?.image}
                alt={session?.user?.name}
              />
              <Avatar.Fallback className="bg-green-300 text-white">
                {session?.user?.name?.charAt(0).toUpperCase()}
              </Avatar.Fallback>
            </Avatar>

            <div>
              <p className="font-semibold text-slate-800">
                {session?.user?.name}
              </p>
              <p className="font-semibold text-sm text-slate-600">
                {session?.user?.email}
              </p>
              <p className="text-sm text-slate-500 font-semibold capitalize">
                {session?.user?.role}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <NavContent navItems={menu} />
        </div>
      </aside>

      {/* Mobile Drawer */}
      <Drawer>
        <Button className="lg:hidden" variant="flat" size="sm">
          <Bars />
          Menu
        </Button>

        <Drawer.Backdrop>
          <Drawer.Content placement="left">
            <Drawer.Dialog className="flex w-60 flex-col p-0">
              <Drawer.Header className="flex items-center gap-2.5 border-b px-4 py-4">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="text-sm font-semibold">M</span>
                </div>

                <Drawer.Heading className="text-sm font-medium">
                  Marketplace
                </Drawer.Heading>

                <Drawer.CloseTrigger className="ml-auto" />
              </Drawer.Header>

              <Drawer.Body className="flex-1 overflow-y-auto p-0">
                <NavContent navItems={menu} />
              </Drawer.Body>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </>
  );
}
