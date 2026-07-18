"use client";

import { useCallback, useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";

import { isGoogleConfigured } from "@/components/auth/google-auth-provider";
import { identityStorage } from "@/lib/auth/identity-storage";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { STORAGE_KEYS, type UserIdentity } from "@/lib/types";

/**
 * Display-only identity hook. Calls the GIS implicit-flow OAuth, hits the
 * OpenID userinfo endpoint with the access token, and stores identity in
 * localStorage so reloads stay signed-in. No refresh tokens, no scopes beyond
 * `openid email profile`.
 */
export function useGoogleIdentity() {
  const [identity, setIdentity, isHydrated] = useLocalStorage<UserIdentity | null>(
    STORAGE_KEYS.identity,
    null,
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configured = isGoogleConfigured();

  const request = useGoogleLogin({
    flow: "implicit",
    scope: "openid email profile",
    onSuccess: async (tokenResponse) => {
      setPending(true);
      setError(null);
      try {
        const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        if (!res.ok) throw new Error(`userinfo HTTP ${res.status}`);
        const profile = (await res.json()) as {
          sub: string;
          email: string;
          name: string;
          picture?: string;
        };
        if (!profile?.sub || !profile?.email) {
          throw new Error("userinfo missing sub/email");
        }
        setIdentity({
          sub: profile.sub,
          email: profile.email,
          name: profile.name || profile.email,
          picture: profile.picture,
          signedInAt: new Date().toISOString(),
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setError(`Couldn't finish sign-in: ${msg}`);
      } finally {
        setPending(false);
      }
    },
    onError: () => {
      setPending(false);
      setError("Google sign-in was cancelled or failed.");
    },
  });

  const signIn = useCallback(() => {
    if (!configured) {
      setError(
        "Google sign-in is not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID and rebuild.",
      );
      return;
    }
    setError(null);
    request();
  }, [configured, request]);

  const signOut = useCallback(() => {
    setIdentity(null);
    setError(null);
  }, [setIdentity]);

  return {
    identity: isHydrated ? identity : null,
    isHydrated,
    pending,
    error,
    configured,
    signIn,
    signOut,
    /**
     * Synchronous reader for cases where a Server Component-rendered surface
     * just needs to peek at persisted identity.
     */
    cachedRead: identityStorage.read,
  };
}
