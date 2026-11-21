"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { checkAccountStatusAction } from "@/lib/actions/auth-status";

/**
 * Global client-side listener for authoritative backend blocked-user detection.
 * Catches blocked accounts on:
 * - Switching back to previously opened tabs (document visibilitychange / window focus)
 * - Navigation to protected routes
 *
 * Does nothing for anonymous visitors and does not trigger on /account/blocked (preventing redirect loops).
 */
export default function BlockedUserListener() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const lastCheckRef = useRef(0);

  useEffect(() => {
    // If unauthenticated or already on the blocked page, do nothing
    if (!session?.user || pathname === "/account/blocked") {
      return;
    }

    const checkStatus = async () => {
      const now = Date.now();
      // Throttle checks to avoid spamming the backend
      const isProtected =
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/products/") ||
        pathname.startsWith("/checkout");

      // For non-protected pages, throttle to at most once per 30 seconds
      if (!isProtected && now - lastCheckRef.current < 30000) {
        return;
      }
      // For protected pages, throttle to at most once per 5 seconds
      if (isProtected && now - lastCheckRef.current < 5000) {
        return;
      }

      lastCheckRef.current = now;

      try {
        const result = await checkAccountStatusAction();
        if (result?.blocked) {
          window.location.href = "/account/blocked";
        }
      } catch (err) {
        if (
          (typeof err?.digest === "string" && err.digest.startsWith("NEXT_REDIRECT")) ||
          err?.message?.includes("/account/blocked")
        ) {
          window.location.href = "/account/blocked";
        }
      }
    };

    // Immediate check if on a protected route
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/products/") ||
      pathname.startsWith("/checkout")
    ) {
      checkStatus();
    }

    // Check when user switches back to this tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkStatus();
      }
    };

    const handleFocus = () => {
      checkStatus();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [session, pathname]);

  return null;
}
