"use client";

import { Playfair_Display } from "next/font/google";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  Dropdown,
  DropdownTrigger,
  DropdownPopover,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
  Button,
  Label,
  Description,
  Header,
  Separator,
  Drawer,
} from "@heroui/react";
import {
  User,
  Home,
  LogOut,
  ChevronDown,
  Menu,
  Settings,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { navMenu, NavContent } from "./DashboardSidebar";
import ThemeToggle from "@/components/Theme/ThemeToggle";

const play = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default function DashboardNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();

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

  const user = session?.user;
  const role = user?.role || "buyer";
  const menu = navMenu[role] || [];
  const displayName = user?.name || "Market User";
  const displayEmail = user?.email || "";
  const avatarSrc = user?.image || undefined;
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Compute breadcrumbs from pathname
  const pathParts = pathname.split("/").filter(Boolean);
  const currentSection =
    pathParts.length > 2
      ? pathParts[pathParts.length - 1].replace(/-/g, " ")
      : pathParts[pathParts.length - 1] || "Dashboard";

  return (
    <nav className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-[#0f172a]/85 backdrop-blur-md px-4 sm:px-6 py-2.5 transition-colors duration-200">
      <div className="mx-auto flex items-center justify-between gap-4">
        {/* Left: Mobile Drawer Trigger + Brand / Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="lg:hidden">
            <Drawer>
              <Drawer.Trigger className="inline-flex items-center justify-center p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open navigation menu</span>
              </Drawer.Trigger>
              <Drawer.Content className="dark:bg-[#0f172a] dark:text-slate-100 dark:border-slate-800">
                <Drawer.Header>
                  <Drawer.Title>
                    <div className="flex items-center justify-between">
                      <Link href="/" className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs">
                          R
                        </span>
                        <h2 className={`${play.className} text-emerald-600 dark:text-emerald-400 text-xl font-bold`}>
                          ReSell Hub
                        </h2>
                      </Link>
                      <ThemeToggle variant="compact" />
                    </div>
                    <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400 capitalize">
                      {role} Portal
                    </p>
                  </Drawer.Title>
                </Drawer.Header>
                <Drawer.Body className="p-0">
                  <NavContent navItems={menu} />
                </Drawer.Body>
              </Drawer.Content>
            </Drawer>
          </div>

          {/* Breadcrumbs for desktop & mobile */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
            <Link
              href={`/dashboard/${role}/overview`}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition capitalize truncate hidden sm:inline"
            >
              {role} Dashboard
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 shrink-0 hidden sm:inline" />
            <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize truncate">
              {currentSection}
            </span>
          </div>
        </div>

        {/* Right: Theme Toggle & User Profile Dropdown */}
        <div className="flex items-center gap-2.5 shrink-0">
          <ThemeToggle variant="compact" />

          {isPending ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
          ) : session ? (
            <Dropdown>
              <DropdownTrigger>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
                >
                  <Avatar size="sm" className="h-7 w-7 border border-slate-200 dark:border-slate-700">
                    <AvatarImage src={avatarSrc} alt={displayName} />
                    <AvatarFallback className="bg-emerald-600 text-white font-semibold text-xs">
                      {initials || <User className="h-3.5 w-3.5" />}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-xs font-semibold capitalize sm:inline max-w-[120px] truncate">
                    {displayName}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                </button>
              </DropdownTrigger>

              <DropdownPopover
                className="min-w-[230px] dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100"
                placement="bottom end"
                crossOffset={-10}
              >
                <DropdownMenu>
                  {/* User info header */}
                  <DropdownSection>
                    <Header>
                      <div className="flex items-center gap-3 px-1 py-1">
                        <Avatar size="sm" className="h-8 w-8">
                          <AvatarImage src={avatarSrc} alt={displayName} />
                          <AvatarFallback className="bg-emerald-600 text-white font-bold text-xs">
                            {initials || <User className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <Label className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate block">
                            {displayName}
                          </Label>
                          <Description className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                            {displayEmail}
                          </Description>
                        </div>
                      </div>
                    </Header>
                  </DropdownSection>

                  <Separator className="dark:bg-slate-800" />

                  {/* Settings */}
                  <DropdownItem
                    key="settings"
                    onAction={() => router.push("/dashboard/settings")}
                  >
                    <div className="flex items-center gap-2.5 text-xs py-0.5">
                      <Settings className="h-4 w-4 text-slate-400 dark:text-slate-400" />
                      <Label>Settings</Label>
                    </div>
                  </DropdownItem>

                  {/* Profile */}
                  <DropdownItem
                    key="profile"
                    onAction={() => router.push("/dashboard/buyer/profile")}
                  >
                    <div className="flex items-center gap-2.5 text-xs py-0.5">
                      <User className="h-4 w-4 text-slate-400 dark:text-slate-400" />
                      <Label>My Profile</Label>
                    </div>
                  </DropdownItem>

                  {/* Storefront / Marketplace Home */}
                  <DropdownItem
                    key="home"
                    onAction={() => router.push("/")}
                  >
                    <div className="flex items-center gap-2.5 text-xs py-0.5">
                      <Home className="h-4 w-4 text-slate-400 dark:text-slate-400" />
                      <Label>Marketplace Home</Label>
                    </div>
                  </DropdownItem>

                  <Separator className="dark:bg-slate-800" />

                  {/* Logout */}
                  <DropdownItem
                    key="logout"
                    className="text-danger"
                    onAction={handleLogout}
                  >
                    <div className="flex items-center gap-2.5 text-xs py-0.5 text-rose-600 dark:text-rose-400">
                      <LogOut className="h-4 w-4" />
                      <Label>Sign Out</Label>
                    </div>
                  </DropdownItem>
                </DropdownMenu>
              </DropdownPopover>
            </Dropdown>
          ) : (
            <Button
              variant="flat"
              size="sm"
              className="text-xs font-semibold"
              onPress={() => router.push("/auth/login")}
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}