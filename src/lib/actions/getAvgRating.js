"use server";
const baseUrl = process.env.NEXT_PUBLIC_RESELL_SERVER_URL
export const getAvgRating = async (productId) =>{
    const res = await fetch(`${baseUrl}/api/reviews/avarage-rating?productId=${productId}`);
    return res.json();
}