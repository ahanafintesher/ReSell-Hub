import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { serverFetch } from "@/lib/api-client";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Authoritative status check against backend
  const profileRes = await serverFetch("/api/users/profile");
  if (profileRes?.status === 403) {
    const errorData = await profileRes.json().catch(() => ({}));
    if (errorData?.code === "ACCOUNT_BLOCKED") {
      redirect("/account/blocked");
    }
  }

  const role = session.user.role || "buyer";
  if (role === "admin") {
    redirect("/dashboard/admin/overview");
  } else if (role === "seller") {
    redirect("/dashboard/seller/overview");
  } else {
    redirect("/dashboard/buyer/overview");
  }
}
