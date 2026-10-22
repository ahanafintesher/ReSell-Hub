import { redirect } from "next/navigation";

export default function SellerDashboardRoot() {
  redirect("/dashboard/seller/overview");
}
