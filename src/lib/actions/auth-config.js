"use server";

/**
 * Checks whether Google OAuth is configured on the server without exposing secrets to the client.
 */
export const getGoogleAuthConfig = async () => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const googleClientSecret = (
    process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_SECRET_KEY
  )?.trim();

  return {
    isConfigured: Boolean(googleClientId && googleClientSecret),
  };
};
