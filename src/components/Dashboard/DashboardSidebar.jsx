"use client";
import { Bars } from "@gravity-ui/icons";
import { ChartBar } from "@gravity-ui/icons";
import { CirclePlus } from "@gravity-ui/icons";
import { House } from "@gravity-ui/icons";
import { ListCheck } from "@gravity-ui/icons";
import { Person } from "@gravity-ui/icons";
import { GoPackage } from "react-icons/go";
import { useState } from "react";

import { Badge, Button, Drawer } from "@heroui/react";
import { div } from "motion/react-client";
import { LayoutDashboard } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Avatar } from "@heroui/react";

const navItems = [
  { icon: House, label: "Dashboard", href: "#" },
  { icon: CirclePlus, label: "Add Products", href: "#add" },
  { icon: GoPackage, label: "My Products", href: "#products", badge: 12 },
  { icon: ListCheck, label: "Manage Orders", href: "#orders", badge: 3 },
  { icon: ChartBar, label: "Analytics", href: "#analytics" },
  { icon: Person, label: "Profile", href: "#profile" },
];

function NavContent({ activePath, onNavigate }) {
  return (
    <nav className="flex flex-col gap-0.5 px-2 py-2.5">
      {navItems.map((item) => {
        const isActive = activePath === item.href;

        return (
          <a
            key={item.label}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            onClick={(e) => {
              e.preventDefault();
              onNavigate?.(item.href);
            }}
            className={[
              "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
              isActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-default-600 hover:bg-default-100 hover:text-foreground",
            ].join(" ")}
          >
            <item.icon
              className={[
                "size-[18px] shrink-0",
                isActive ? "text-primary" : "text-default-500",
              ].join(" ")}
            />

            <span className="flex-1">{item.label}</span>

            {item.badge != null && (
              <Badge size="sm" color="primary" variant="flat">
                {item.badge}
              </Badge>
            )}
          </a>
        );
      })}
    </nav>
  );
}

export default function DashboardSidebar() {
  const { data: session, error } = authClient.useSession();
  const [activePath, setActivePath] = useState("#");

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
              <Avatar.Fallback className='bg-green-300 text-white'>
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
          <NavContent activePath={activePath} onNavigate={setActivePath} />
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
                <NavContent
                  activePath={activePath}
                  onNavigate={setActivePath}
                />
              </Drawer.Body>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </>
  );
}
