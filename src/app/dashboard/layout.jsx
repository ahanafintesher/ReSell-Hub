import DashboardNavbar from "@/components/Dashboard/DashboardNavbar";
import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

const DashboardLayout = async ({ children }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/login");
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