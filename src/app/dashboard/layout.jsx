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
    <div className="flex min-h-screen bg-slate-50/60 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <DashboardSidebar />

      <main className="flex-1 min-w-0 flex flex-col">
        <DashboardNavbar />
        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;