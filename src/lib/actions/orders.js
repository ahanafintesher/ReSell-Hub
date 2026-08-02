"use server";

const baseUrl = process.env.NEXT_RESELL_SERVER_URL || "http://localhost:5000";

// post a order

export const postOrder = async (orderData) => {
  const res = await fetch(`${baseUrl}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  });

  if (!res.ok) {
    throw new Error("Failed to create order");
  }

  return res.json();
};

// get orders by sellerInfo

export const getOrdersBySellerInfo = async (sellerInfo) => {
  const res = await fetch(
    `${baseUrl}/api/seller/orders?sellerInfo=${sellerInfo}`,
  );
  return res.json();
};

// get orders by buyerInfo

export const getOrdersByBuyerInfo = async (buyerInfo) => {
  const res = await fetch(
    `${baseUrl}/api/buyer/orders?buyerInfo=${buyerInfo}`,
  );
  return res.json();
};


// update order status

export const updateOrderStatus = async (orderId, status) => {
  const res = await fetch(`${baseUrl}/api/orders/${orderId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    throw new Error("Failed to update order status");
  }

  return res.json();
};