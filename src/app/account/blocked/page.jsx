import React from "react";
import Link from "next/link";
import { Button } from "@heroui/react";
import { ShieldAlert, Home } from "lucide-react";
import ThemeToggle from "@/components/Theme/ThemeToggle";

export const metadata = {
  title: "Account Blocked — ReSell Hub",
  description: "Your account has been blocked by an administrator.",
};

export default function BlockedPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
      {/* Minimal Top Header with Theme Toggle */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 select-none">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            RH
          </div>
          <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
            ReSell Hub
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* Main Blocked Notice Card */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-xl text-center transition-colors">
          {/* Alert Icon Badge */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 shadow-inner">
            <ShieldAlert className="h-10 w-10 stroke-[1.75]" />
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            You Have Been Blocked by Admin
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
            Your account has been blocked by an administrator. You no longer have permission to access protected areas of this website. If you believe this action was taken by mistake, please contact the website administrator.
          </p>

          {/* Return to Home Page Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/" className="w-full sm:w-auto">
              <Button
                color="primary"
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold px-8 py-3 rounded-xl shadow-md transition-all text-base inline-flex items-center justify-center gap-2 cursor-pointer"
                size="lg"
              >
                <Home className="w-4 h-4" />
                Return to Home Page
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Minimal Footer Notice */}
      <footer className="w-full max-w-7xl mx-auto px-4 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
        ReSell Hub Security & Access Control System
      </footer>
    </div>
  );
}
