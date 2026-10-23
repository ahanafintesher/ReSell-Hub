import { redirect } from "next/navigation";

export default async function DashboardPaymentSuccessRedirect({ searchParams }) {
  const params = await searchParams;
  const sessionId = params?.session_id;

  if (sessionId) {
    redirect(`/success/payment-success?session_id=${encodeURIComponent(sessionId)}`);
  }

  redirect("/dashboard/buyer/orders");
}
