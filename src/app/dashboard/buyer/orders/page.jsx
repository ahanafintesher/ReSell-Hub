import React from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getOrdersByBuyerInfo } from "@/lib/actions/orders";
import BuyerOrderCard from "@/components/Order/BuyerOrderCard";

const MyOrdersPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const buyerInfo = session?.user?.email;
  const orders = await getOrdersByBuyerInfo(buyerInfo);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">My Orders</h1>
        <p className="text-sm text-gray-500">Track your purchases and delivery status.</p>
      </div>

      {orders?.length ? (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <BuyerOrderCard key={order._id} order={JSON.parse(JSON.stringify(order))} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500 border border-dashed rounded-xl">
          You haven't placed any orders yet.
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;