"use client";

import { useState } from "react";
import { Button, Avatar, Dropdown, Label } from "@heroui/react";
import {
  Person,
  Gear,
  Box,
  ArrowRightFromSquare,
  ChevronDown,
  Bars,
  Xmark,
} from "@gravity-ui/icons";
import Link from "next/link";
import NavLinks from "./Navlinks";

// ── Logo ──────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 select-none shrink-0">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-background font-black text-xs tracking-tight">
       RH
      </div>
      <span className="hidden sm:block leading-tight">
        <span className="block font-bold text-sm text-foreground tracking-wide">
         ReSell Hub
        </span>
       
      </span>
    </Link>
  );
}

// ── Auth buttons ──────────────────────────────────────────────────────────────
function AuthButtons() {
  return (
    <div className="flex items-center gap-2">
     <Link href={'/auth/login'}>
      <Button
       
        variant="flat"
        size="sm"
        radius="full"
        className="font-semibold"
      >
        Login
      </Button>
     </Link>
     <Link href={'/auth/register'}>
      <Button
        
        color="primary"
        size="sm"
        radius="full"
        className="font-semibold"
      >
        Register
      </Button>
     </Link>
    </div>
  );
}

// ── User dropdown ─────────────────────────────────────────────────────────────
function UserMenu({ user }) {
  return (
    <Dropdown>
      <Dropdown.Trigger>
        <button
          className="flex items-center gap-2 rounded-full border-2 border-primary pl-1 pr-2.5 py-1 hover:bg-default-100 transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="User menu"
        >
          <Avatar
            src={user.avatar}
            name={user.name}
            showFallback
            size="sm"
            color="primary"
            classNames={{
              base: "w-7 h-7 shrink-0",
              name: "text-xs font-semibold",
            }}
          />
          <span className="hidden sm:block text-sm font-medium text-foreground max-w-[90px] truncate">
            {user.name}
          </span>
          <ChevronDown className="w-3 h-3 text-foreground/40 shrink-0" />
        </button>
      </Dropdown.Trigger>

      <Dropdown.Popover placement="bottom end" className="min-w-44">
        <Dropdown.Menu
          onAction={(key) => {
            if (key === "logout") {
              console.log("logout");
            }
          }}
        >
          <Dropdown.Item id="profile" textValue="My Profile">
            <Link href="/profile" className="flex items-center gap-3 w-full">
              <Person className="w-4 h-4 text-foreground/60 shrink-0" />
              <Label>My Profile</Label>
            </Link>
          </Dropdown.Item>

          <Dropdown.Item id="settings" textValue="Settings">
            <Link href="/settings" className="flex items-center gap-3 w-full">
              <Gear className="w-4 h-4 text-foreground/60 shrink-0" />
              <Label>Settings</Label>
            </Link>
          </Dropdown.Item>

          <Dropdown.Item id="orders" textValue="Orders">
            <Link href="/orders" className="flex items-center gap-3 w-full">
              <Box className="w-4 h-4 text-foreground/60 shrink-0" />
              <Label>Orders</Label>
            </Link>
          </Dropdown.Item>

          <Dropdown.Item id="logout" textValue="Logout" variant="danger">
            <span className="flex items-center gap-3 w-full">
              <ArrowRightFromSquare className="w-4 h-4 shrink-0" />
              <Label>Logout</Label>
            </span>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = null; // set to user object when logged in
  const isLoggedIn = !!user;

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-divider bg-background/80 backdrop-blur-md backdrop-saturate-150">
      <header className="flex h-14 items-center justify-between px-4 sm:px-6 max-w-screen-xl mx-auto gap-4">

        {/* Left — Logo */}
        <Logo />

        {/* Center — Nav links (desktop) */}
        <div className="hidden md:flex flex-1 justify-center">
          <NavLinks />
        </div>

        {/* Right — Auth / User */}
        <div className="flex items-center gap-2 shrink-0">
          {isLoggedIn ? (
            <UserMenu user={user} />
          ) : (
            <div className="hidden sm:block">
              <AuthButtons />
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-1.5 rounded-md text-foreground/70 hover:text-foreground hover:bg-default-100 transition-colors focus-visible:ring-2 focus-visible:ring-primary outline-none"
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

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div
          id="mobile-nav"
          className="md:hidden border-t border-divider bg-background px-4 pb-4 pt-3"
        >
          <NavLinks mobile onNavigate={closeMobile} />

          {/* Auth buttons in mobile drawer when logged out */}
          {!isLoggedIn && (
            <div className="mt-3 pt-3 border-t border-divider flex flex-col gap-2">
              <Button
                as={Link}
                href="/login"
                variant="flat"
                size="sm"
                radius="full"
                className="font-semibold w-full"
                onClick={closeMobile}
              >
                Login
              </Button>
              <Button
                as={Link}
                href="/register"
                color="primary"
                size="sm"
                radius="full"
                className="font-semibold w-full"
                onClick={closeMobile}
              >
                Register
              </Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}