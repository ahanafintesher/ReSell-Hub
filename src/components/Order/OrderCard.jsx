"use client";

import React, { useState, useTransition } from "react";
import { Button, Label, ListBox, Select } from "@heroui/react";
import { updateOrderStatus } from "@/lib/actions/orders";

const STATUS_FLOW = ["accepted", "processing", "shipped", "delivered"];

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

const OrderCard = ({ order }) => {
  const [status, setStatus] = useState(order.orderStatus);
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (newStatus) => {
    const prevStatus = status;
    setStatus(newStatus); // optimistic UI

    startTransition(async () => {
      try {
        await updateOrderStatus(order._id, newStatus);
      } catch (error) {
        console.error(error);
        setStatus(prevStatus); // fail হলে revert
      }
    });
  };

  // current status এর index বের করে সেখান থেকে বাকি options নেওয়া হচ্ছে
  const currentIndex = STATUS_FLOW.indexOf(status);
  const availableStatuses =
    currentIndex === -1 ? STATUS_FLOW : STATUS_FLOW.slice(currentIndex);

  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-medium text-gray-900">{order.productTitle}</h3>
          <p className="text-sm text-gray-500">Order ID: {order._id}</p>
          <p className="text-sm text-gray-500">
            Placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            STATUS_COLORS[status] || "bg-gray-100 text-gray-600"
          }`}
        >
          {STATUS_LABELS[status] || status}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        <p>
          <span className="text-gray-500">Buyer:</span> {order.buyerName}
        </p>
        <p>
          <span className="text-gray-500">Buyer Contact:</span>{" "}
          {order.buyerInfo}
        </p>
        <p>
          <span className="text-gray-500">Price:</span> ৳{order.price}
        </p>
        <p>
          <span className="text-gray-500">Payment:</span> {order.paymentStatus}
        </p>
      </div>

      <div className="mt-5 flex items-center gap-3">
        {status === "pending" && (
          <>
            <Button
              isDisabled={isPending}
              onPress={() => handleUpdate("accepted")}
            >
              Accept
            </Button>
            <Button
              variant="danger"
              isDisabled={isPending}
              onPress={() => handleUpdate("rejected")}
            >
              Reject
            </Button>
          </>
        )}

        {STATUS_FLOW.includes(status) && status !== "delivered" && (
          <Select
            className="w-[220px]"
            selectedKey={status}
            onSelectionChange={(key) => handleUpdate(key)}
            isDisabled={isPending}
          >
            <Label>Delivery Status</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {availableStatuses.map((s) => (
                  <ListBox.Item key={s} id={s} textValue={STATUS_LABELS[s]}>
                    {STATUS_LABELS[s]}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        )}

        {status === "rejected" && (
          <p className="text-sm text-red-500">This order was rejected.</p>
        )}

        {status === "delivered" && (
          <p className="text-sm text-green-600">This product is delivered.</p>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
