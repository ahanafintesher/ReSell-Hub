import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, jwtClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    (typeof window !== "undefined"
      ? window.location.origin
      : process.env.BETTER_AUTH_URL?.trim() || "http://localhost:3000"),
  plugins: [
    inferAdditionalFields(),
    jwtClient(),
  ],
});

export const { signIn, signUp, useSession } = authClient;