'use client';
import {Bars} from '@gravity-ui/icons';
import {ChartBar} from '@gravity-ui/icons';
import {CirclePlus} from '@gravity-ui/icons';
import {House} from '@gravity-ui/icons';
import {ListCheck} from '@gravity-ui/icons';
import {Person} from '@gravity-ui/icons';
import { GoPackage } from "react-icons/go";
import { useState } from "react";

import { Badge, Button, Drawer } from "@heroui/react";

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
  const [activePath, setActivePath] = useState("#");

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r lg:flex">
       

        <div className="flex-1 overflow-y-auto">
          <NavContent
            activePath={activePath}
            onNavigate={setActivePath}
          />
        </div>

        
      </aside>

      {/* Mobile Drawer */}
      <Drawer>
        <Button
          className="lg:hidden"
          variant="flat"
          size="sm"
        >
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