"use client";

import { useCallback, useEffect, useState } from "react";
import { safeStorage } from "@/lib/storage";

/**
 * useLocalStorage — SSR-safe persisted state.
 * - On the server, returns the initial value and `isHydrated === false`.
 * - On mount, hydrates from localStorage and flips `isHydrated` to true.
 * - Only persists *after* hydration so the initial paint cannot overwrite
 *   stored data on a hot reload.
 *
 * Return tuple: [value, setValue, isHydrated, reset]
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from storage on mount.
  useEffect(() => {
    const stored = safeStorage.get<T>(key);
    if (stored !== null) setValue(stored);
    setIsHydrated(true);
  }, [key]);

  // Persist on change — only after hydration completes.
  useEffect(() => {
    if (!isHydrated) return;
    safeStorage.set(key, value);
  }, [key, value, isHydrated]);

  const reset = useCallback(() => setValue(initialValue), [initialValue]);

  return [value, setValue, isHydrated, reset] as const;
}
