import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const getBaseUrl = () => {
  return (
    process.env.RESELL_SERVER_URL ||
    process.env.NEXT_PUBLIC_RESELL_SERVER_URL ||
    "http://localhost:5000"
  ).replace(/\/$/, "");
};

/**
 * Server-to-server authenticated fetch for Next.js Server Actions.
 * Automatically obtains the user's JWT from Better Auth and attaches it
 * as an Authorization: Bearer <token> header to Express backend requests.
 */
export async function serverFetch(endpoint, options = {}) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const requestHeaders = new Headers(options.headers || {});
  if (!requestHeaders.has("Content-Type") && !(options.body instanceof FormData)) {
    requestHeaders.set("Content-Type", "application/json");
  }

  try {
    const incomingHeaders = await headers();
    const tokenResult = await auth.api.getToken({
      headers: incomingHeaders,
    });

    if (tokenResult?.token) {
      requestHeaders.set("Authorization", `Bearer ${tokenResult.token}`);
    }
  } catch (err) {
    // Session token could not be resolved (unauthenticated or background context)
  }

  return fetch(url, {
    ...options,
    headers: requestHeaders,
  });
}
