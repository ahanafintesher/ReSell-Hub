import React from "react";

const STATUS_LABELS = {
  pending: "Pending",
  accepted: "Accepted",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  rejected: "Rejected",
};

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-blue-100 text-blue-700",
  processing: "bg-indigo-100 text-indigo-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const BuyerOrderCard = ({ order }) => {
  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-medium text-gray-900">{order.productTitle}</h3>
          <p className="text-sm text-gray-500">Order ID: {order._id}</p>
          <p className="text-sm text-gray-500">
            Ordered on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            STATUS_COLORS[order.orderStatus] || "bg-gray-100 text-gray-600"
          }`}
        >
          {STATUS_LABELS[order.orderStatus] || order.orderStatus}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
  <div>
    <span className="text-gray-500">Seller</span>
    <p><span>Seller Name: </span>{order.sellerName || "N/A"}</p>
    <p><span>Seller Email: </span>{order.sellerInfo || "N/A"}</p>
  </div>

  <div className="min-w-0">
    <span className="text-gray-500">Transaction ID</span>
    <p className="mt-1 text-xs break-all">
      {order.paymentId}
    </p>
  </div>

  <div>
    <span className="text-gray-500">Price</span>
    <p>৳{order.price}</p>
  </div>

  <div>
    <span className="text-gray-500">Payment</span>
    <p>{order.paymentStatus}</p>
  </div>
</div>

      {order.orderStatus === "rejected" && (
        <p className="mt-3 text-sm text-red-500">
          This order was rejected by the seller.
        </p>
      )}

      {order.orderStatus === "delivered" && (
        <p className="mt-3 text-sm text-green-600">
          This product has been delivered.
        </p>
      )}
    </div>
  );
};

export default BuyerOrderCard;
