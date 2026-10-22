import { redirect } from "next/navigation";

export default function BuyerDashboardRoot() {
  redirect("/dashboard/buyer/overview");
}