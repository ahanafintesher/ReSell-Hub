import DashboardNavbar from "@/components/Dashboard/DashboardNavbar";
import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import React from "react";

const DashboardLayout = ({ children }) => {
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