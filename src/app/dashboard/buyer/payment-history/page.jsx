"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";

import { getPaymentHistory } from "@/lib/actions/paymentHistory";
import PaymentCard from "@/components/Payment/paymentCard";

const PaymentHistoryPage = () => {
  const { data } = useSession();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const userEmail = data?.user?.email || null;

  useEffect(() => {
    const fetchPayments = async () => {
      if (!userEmail) {
        setLoading(false);
        return;
      }

      try {
        const result = await getPaymentHistory(userEmail);

        setPayments(result);
      } catch (error) {
        console.error("Failed to fetch payments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [userEmail]);

  if (loading) {
    return (
      <div className="p-5">
        <h1 className="text-2xl font-semibold text-gray-900">
          Payment History
        </h1>

        <p className="mt-4 text-gray-500">
          Loading payment history...
        </p>
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Payment History
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          View all your completed payments.
        </p>
      </div>

      {payments.length === 0 ? (
        <div className="border border-gray-200 rounded-xl p-10 bg-white shadow-sm text-center">
          <h2 className="text-lg font-medium text-gray-900">
            No payment history found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Your completed payments will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <PaymentCard
              key={payment._id}
              payment={payment}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentHistoryPage;