"use server";
const baseUrl = process.env.NEXT_RESELL_SERVER_URL || "http://localhost:5000";
export const getMyProducts = async (sellerInfo) => {
  const res = await fetch(
    `${baseUrl}/api/my-products?sellerInfo=${sellerInfo}`,
  );
  return res.json();
};



