"use server";

import { serverFetch } from "@/lib/api-client";

/**
 * Authoritatively verifies current user's account status against Express backend.
 * Returns { blocked: true, code: "ACCOUNT_BLOCKED" } if the user is blocked.
 * Used by client-side status listeners, tab focus guards, and route pre-checks.
 */
export async function checkAccountStatusAction() {
  try {
    const res = await serverFetch("/api/users/profile", {
      cache: "no-store",
      skipBlockedRedirect: true,
    });

    if (res?.status === 403) {
      const data = await res.json().catch(() => ({}));
      if (data?.code === "ACCOUNT_BLOCKED") {
        return { blocked: true, code: "ACCOUNT_BLOCKED" };
      }
    }

    if (res?.ok) {
      const profile = await res.json().catch(() => ({}));
      return {
        blocked: profile?.status === "blocked",
        status: profile?.status || "active",
        role: profile?.role || "buyer",
      };
    }

    return { blocked: false };
  } catch (err) {
    if (typeof err?.digest === "string" && err.digest.startsWith("NEXT_REDIRECT")) {
      return { blocked: true, code: "ACCOUNT_BLOCKED" };
    }
    return { blocked: false };
  }
}
