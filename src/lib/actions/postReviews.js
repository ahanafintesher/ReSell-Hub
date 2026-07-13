"use server";
const baseurl = process.env.NEXT_PUBLIC_RESELL_SERVER_URL;
export const postReviews = async (review) =>{
    const res = await fetch(`${baseurl}/api/reviews`, {
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify({review})
    })
}