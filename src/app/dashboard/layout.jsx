import DashboardNavbar from "@/components/Dashboard/DashboardNavbar";
import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { serverFetch } from "@/lib/api-client";

const DashboardLayout = async ({ children }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Authoritative backend status verification for all dashboard routes
  // Catches blocked users and stale sessions before sidebar or dashboard content render
  const profileRes = await serverFetch("/api/users/profile");
  if (profileRes?.status === 403) {
    const errorData = await profileRes.json().catch(() => ({}));
    if (errorData?.code === "ACCOUNT_BLOCKED") {
      redirect("/account/blocked");
    }
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-slate-50/60 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <DashboardSidebar initialUser={session.user} />

      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        <DashboardNavbar initialUser={session.user} />
        <main
          id="dashboard-main-content"
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden"
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
