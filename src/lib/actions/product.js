"use server";

const baseUrl = process.env.NEXT_RESELL_SERVER_URL || "http://localhost:5000";

export const createProduct = async (productData) => {
  const res = await fetch(`${baseUrl}/api/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  });
  console.log(res);
  return res.json();
};

export const editProducts = async (id, productData) => {
  const res = await fetch(`${baseUrl}/api/products?id=${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  });

  return res.json();
};





export const deleteProducts = async (id) => {
  const res = await fetch(`${baseUrl}/api/products/${id}`, {
    method: "DELETE",
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`Delete failed: ${res.status} - ${text}`);
  }

  return JSON.parse(text);
};
