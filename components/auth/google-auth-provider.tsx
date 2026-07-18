"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

/**
 * Client-only wrapper around Google's OAuth provider. Mounting this in a
 * Server Component would break the React context boundary, so the root layout
 * (server) imports this thin client shim instead.
 *
 * The provider always renders — even with an empty clientId — so children can
 * unconditionally call useGoogleLogin; calls then no-op gracefully.
 */
export function GoogleAuthProvider({ children }: { children: React.ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
  return (
    <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>
  );
}

/** True when the runtime env has a Google OAuth client id configured. */
export function isGoogleConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
}
