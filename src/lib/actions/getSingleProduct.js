"use server";
const baseurl = process.env.NEXT_PUBLIC_RESELL_SERVER_URL;
export const getSingleProduct = async (id) =>{
    const res = await fetch(`${baseurl}/api/products/${id}`)
    return res.json();
}