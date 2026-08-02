import SellerOrderCard from '@/components/Order/SellerOrderCard';
import OrderCard from '@/components/Order/SellerOrderCard';
import { getOrdersBySellerInfo } from '@/lib/actions/orders';
import { auth } from '@/lib/auth';
import { headers } from "next/headers";
import React from 'react';

const OrdersPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const sellerInfo = session?.user?.email;
  const orders = await getOrdersBySellerInfo(sellerInfo);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Manage Orders</h1>
        <p className="text-sm text-gray-500">Handle incoming customer orders.</p>
      </div>

      {orders?.length ? (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <SellerOrderCard key={order._id} order={JSON.parse(JSON.stringify(order))} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500 border border-dashed rounded-xl">
          No orders found yet.
        </div>
      )}
    </div>
  );
};

export default OrdersPage;