import { headers } from "next/headers";
import { redirect } from "next/navigation";
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
 *
 * Centralized Blocked User Detection:
 * When the backend returns 403 with code: "ACCOUNT_BLOCKED", the user is
 * immediately redirected to /account/blocked (unless skipBlockedRedirect is set).
 * Unrelated 403 errors (e.g. role forbidden) are returned normally.
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

  for (let attempt = 0; attempt < 3; attempt++) {
    let res;
    try {
      res = await fetch(url, {
        ...options,
        headers: requestHeaders,
      });
    } catch (err) {
      if (attempt < 2 && (err.code === "ECONNRESET" || err.message?.includes("fetch failed"))) {
        await new Promise((r) => setTimeout(r, 250));
        continue;
      }
      throw err;
    }

    // Global Blocked User Detection
    if (res.status === 403 && !options.skipBlockedRedirect) {
      try {
        const cloned = res.clone();
        const data = await cloned.json();
        if (data?.code === "ACCOUNT_BLOCKED") {
          redirect("/account/blocked");
        }
      } catch (err) {
        if (typeof err?.digest === "string" && err.digest.startsWith("NEXT_REDIRECT")) {
          throw err;
        }
      }
    }

    return res;
  }
}
