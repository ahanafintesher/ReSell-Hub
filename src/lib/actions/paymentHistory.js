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

export const getPaymentHistory = async (userEmail) => {
  const res = await fetch(
    `${baseurl}/api/payments?userEmail=${encodeURIComponent(userEmail)}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch payment history");
  }

  return res.json();
};