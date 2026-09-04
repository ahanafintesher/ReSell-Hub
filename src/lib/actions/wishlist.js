"use server";

const baseurl = process.env.NEXT_PUBLIC_RESELL_SERVER_URL;

export const postWishlist = async (product, userInfo) => {
const res = await fetch(`${baseurl}/api/wishlist`, {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({ product, userInfo }),
});

return res.json();
};





export const getWishlist = async (userInfo) => {
const res = await fetch(
`${baseurl}/api/wishlist?userInfo=${encodeURIComponent(userInfo)}`,
{
cache: "no-store",
},
);

if (!res.ok) {
throw new Error("Failed to fetch wishlist");
}

return res.json();
};
