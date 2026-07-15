"use server";
const baseurl = process.env.NEXT_PUBLIC_RESELL_SERVER_URL;
export const getUserReviews = async (productId) =>{
    const res = await fetch(`${baseurl}/api/reviews?productId=${productId}`)
    return res.json();
}