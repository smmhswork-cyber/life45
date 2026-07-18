"use client";

import { safeStorage } from "@/lib/storage";
import { STORAGE_KEYS, type UserIdentity } from "@/lib/types";

/**
 * Persists the signed-in user identity. Display-only: we never store tokens,
 * just the public profile fields Google returns. Clearing this without
 * signing out at Google means the cached name/picture lingers until reload +
 * the user re-auths.
 */
export const identityStorage = {
  read(): UserIdentity | null {
    return safeStorage.get<UserIdentity>(STORAGE_KEYS.identity);
  },
  write(identity: UserIdentity | null): void {
    if (identity === null) {
      safeStorage.remove(STORAGE_KEYS.identity);
    } else {
      safeStorage.set(STORAGE_KEYS.identity, identity);
    }
  },
};
