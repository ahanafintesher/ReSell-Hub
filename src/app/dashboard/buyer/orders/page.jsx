import React from 'react';
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getOrdersByBuyerInfo } from '@/lib/actions/orders';
const MyOrdersPage = async() => {

const session = await auth.api.getSession({
 headers: await headers(),
})


const buyerInfo = session?.user?.email
const orders = await getOrdersByBuyerInfo(buyerInfo);


console.log(orders);
    return (
        <div>
            my orders
        </div>
    );
};

export default MyOrdersPage;