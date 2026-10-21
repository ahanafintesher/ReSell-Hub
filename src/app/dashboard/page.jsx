import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/login");
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