"use server";
const baseurl = process.env.NEXT_PUBLIC_RESELL_SERVER_URL;
export const postPaymentHistory = async (metadata, session_id, date) =>{
    const res =  await fetch(`${baseurl}/api/payments`,{
        method:"POST",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify({metadata, session_id, date})
    })
}