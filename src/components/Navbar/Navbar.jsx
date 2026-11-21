"use client";
import { Playfair_Display } from "next/font/google";

import { useState, useEffect } from "react";
import { Avatar, Dropdown, Label } from "@heroui/react";
import {
  Person,
  Gear,
  Box,
  ArrowRightFromSquare,
  ChevronDown,
  Bars,
  Xmark,
} from "@gravity-ui/icons";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import NavLinks from "./Navlinks";
import { authClient } from "@/lib/auth-client";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "@/components/Theme/ThemeToggle";
import { useCart } from "@/context/CartContext";

const play = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

// ── Logo ──────────────────────────────────────────────────────────────────────
function Logo() {
  const pathname = usePathname();
  if (pathname.includes("dashboard")) {
    return null;
  }

  return (
    <Link
      href="/"
      className="flex items-center gap-2 select-none shrink-0"
      aria-label="ReSell Hub Home"
    >
      <div className="w-8 h-8 rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shadow-sm shrink-0">
        <Box className="w-4 h-4 text-white" />
      </div>
      <span className="leading-tight">
        <h2
          className={`${play.className} text-emerald-600 dark:text-emerald-400 text-xl sm:text-2xl font-extrabold tracking-tight`}
        >
          ReSell Hub
        </h2>
      </span>
    </Link>
  );
}

// ── Auth buttons ──────────────────────────────────────────────────────────────
function AuthButtons() {
  const pathname = usePathname();
  if (pathname.includes("dashboard")) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/auth/login"
        className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 transition-colors inline-flex items-center justify-center cursor-pointer"
      >
        Login
      </Link>

      <Link
        href="/auth/register"
        className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs transition-colors inline-flex items-center justify-center cursor-pointer"
      >
        Register
      </Link>
    </div>
  );
}

// ── User dropdown ─────────────────────────────────────────────────────────────
function UserMenu({ user }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname.includes("dashboard")) {
    return null;
  }

  const handleAction = async (key) => {
    if (key === "logout") {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/auth/login");
            router.refresh();
          },
        },
      });
    }
  };

  const dashboardHref =
    user?.role === "admin"
      ? "/dashboard/admin/overview"
      : user?.role === "seller"
      ? "/dashboard/seller/overview"
      : "/dashboard/buyer/overview";

  return (
    <Dropdown>
      <Dropdown.Trigger
        className="flex items-center gap-2 rounded-full border-2 border-emerald-600/40 dark:border-emerald-500/40 pl-1 pr-2.5 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer bg-transparent"
        aria-label="User menu"
      >
        <Avatar className="w-7 h-7 shrink-0">
          <Avatar.Image alt={user?.name || "User"} src={user?.image || ""} />
          <Avatar.Fallback className="text-xs font-semibold bg-emerald-600 text-white">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </Avatar.Fallback>
        </Avatar>

        <span className="hidden sm:block text-sm font-medium text-slate-900 dark:text-slate-100 max-w-[90px] truncate">
          {user?.name || "User"}
        </span>

        <ChevronDown className="w-3 h-3 text-slate-500 dark:text-slate-400 shrink-0" />
      </Dropdown.Trigger>

      <Dropdown.Popover placement="bottom end" className="min-w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl p-1">
        <Dropdown.Menu onAction={handleAction}>
          <Dropdown.Item id="dashboard" textValue="Dashboard">
            <Link href={dashboardHref} className="flex items-center gap-3 w-full">
              <Box className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <Label className="cursor-pointer font-medium">Dashboard ({user?.role || "user"})</Label>
            </Link>
          </Dropdown.Item>

          <Dropdown.Item id="profile" textValue="My Profile">
            <Link href="/dashboard/buyer/profile" className="flex items-center gap-3 w-full">
              <Person className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
              <Label className="cursor-pointer">My Profile</Label>
            </Link>
          </Dropdown.Item>

          <Dropdown.Item id="settings" textValue="Settings">
            <Link href="/dashboard/settings" className="flex items-center gap-3 w-full">
              <Gear className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
              <Label className="cursor-pointer">Settings</Label>
            </Link>
          </Dropdown.Item>

          <Dropdown.Item id="orders" textValue="Orders">
            <Link
              href={user?.role === "seller" ? "/dashboard/seller/orders" : "/dashboard/buyer/orders"}
              className="flex items-center gap-3 w-full"
            >
              <Box className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
              <Label className="cursor-pointer">Orders</Label>
            </Link>
          </Dropdown.Item>

          <Dropdown.Item id="cart" textValue="My Cart">
            <Link href="/cart" className="flex items-center gap-3 w-full">
              <ShoppingCart className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
              <Label className="cursor-pointer">My Cart</Label>
            </Link>
          </Dropdown.Item>

          <Dropdown.Item id="logout" textValue="Logout" variant="danger">
            <div className="flex items-center gap-3 w-full text-rose-600 dark:text-rose-400 pointer-events-none">
              <ArrowRightFromSquare className="w-4 h-4 shrink-0" />
              <Label className="font-medium">Logout</Label>
            </div>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const { cartCount } = useCart();

  const user = session?.user;
  const isLoggedIn = !!user;

  const closeMobile = () => setMobileOpen(false);

  // Automatically close mobile menu on route changes during render
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  if (pathname.includes("dashboard")) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-[#0b0f19]/85 backdrop-blur-md backdrop-saturate-150 transition-colors duration-200">
      <header className="flex h-14 items-center justify-between px-4 sm:px-6 max-w-screen-xl mx-auto gap-4">
        {/* Left — Logo */}
        <Logo />

        {/* Center — Nav links (Rendered immediately without blocking on auth) */}
        <div className="hidden lg:flex flex-1 justify-center">
          <NavLinks />
        </div>

        {/* Right — Cart, Theme Toggle, Auth / User */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/cart"
            className="relative p-2 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none cursor-pointer"
            aria-label={`Shopping Cart with ${cartCount} items`}
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white shadow-xs">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          <ThemeToggle variant="compact" />

          {/* Auth State Slot: Clean skeleton during hydration, smooth render once known */}
          {isPending ? (
            <div className="flex items-center gap-2">
              <div className="w-16 h-8 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse hidden sm:block" />
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse sm:hidden" />
            </div>
          ) : isLoggedIn ? (
            <UserMenu user={user} />
          ) : (
            <div className="hidden sm:block">
              <AuthButtons />
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-1.5 rounded-md text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none cursor-pointer"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            {mobileOpen ? (
              <Xmark className="w-5 h-5" />
            ) : (
              <Bars className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          id="mobile-nav"
          className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] px-4 pb-4 pt-3 shadow-lg"
        >
          <NavLinks mobile onNavigate={closeMobile} />

          {!isPending && !isLoggedIn && (
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
              <Link
                href="/auth/login"
                className="w-full py-2 px-3 text-center text-sm font-semibold rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 transition-colors inline-flex items-center justify-center cursor-pointer"
                onClick={closeMobile}
              >
                Login
              </Link>

              <Link
                href="/auth/register"
                className="w-full py-2 px-3 text-center text-sm font-semibold rounded-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs transition-colors inline-flex items-center justify-center cursor-pointer"
                onClick={closeMobile}
              >
                Register
              </Link>
            </div>
          )}

          {!isPending && isLoggedIn && (
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <Avatar.Image src={user?.image} alt={user?.name || "User"} />
                  <Avatar.Fallback className="bg-emerald-600 text-white text-xs font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </Avatar.Fallback>
                </Avatar>
                <div className="text-xs">
                  <p className="font-semibold text-slate-900 dark:text-white">{user?.name}</p>
                  <p className="text-slate-500 capitalize">{user?.role || "buyer"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await authClient.signOut();
                  closeMobile();
                }}
                className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
