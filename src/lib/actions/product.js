"use server";

const baseUrl = process.env.NEXT_RESELL_SERVER_URL || "http://localhost:5000";

export const createProduct = async (productData) => {
    
    const res = await fetch(`${baseUrl}/api/products`,{
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
    })
    console.log(res);
    return res.json();
}