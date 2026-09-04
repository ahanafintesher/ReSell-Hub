import React from "react";

const PaymentCard = ({ payment }) => {
  const metadata = payment.metadata || {};

  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-medium text-gray-900">
            {metadata.title || "Product"}
          </h3>

          <p className="text-sm text-gray-500">
            Payment ID: {payment._id}
          </p>

          <p className="text-sm text-gray-500">
            Paid on{" "}
            {payment.date
              ? new Date(payment.date).toLocaleDateString()
              : "N/A"}
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          Paid
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Amount</span>
          <p className="font-medium text-gray-900">
            ৳{metadata.price || "N/A"}
          </p>
        </div>

        <div className="min-w-0">
          <span className="text-gray-500">Transaction ID</span>

          <p className="mt-1 text-xs break-all">
            {payment.session_id || "N/A"}
          </p>
        </div>

        <div>
          <span className="text-gray-500">Buyer</span>
          <p>{metadata.buyerName || "N/A"}</p>
        </div>

        <div className="min-w-0">
          <span className="text-gray-500">Email</span>
          <p className="break-all">
            {metadata.userEmail || "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentCard;