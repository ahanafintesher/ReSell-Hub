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
    <div className="flex min-h-screen">
      <DashboardSidebar />

      <main className="flex-1">
        <DashboardNavbar />
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;