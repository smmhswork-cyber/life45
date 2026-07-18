"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { safeStorage } from "@/lib/storage";

/**
 * useLocalStorage — SSR-safe persisted state.
 * - On the server, returns the initial value.
 * - On mount, hydrates from localStorage.
 * - Writes every change back to localStorage.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const hydrated = useRef(false);

  // Hydrate from storage on mount
  useEffect(() => {
    const stored = safeStorage.get<T>(key);
    if (stored !== null) setValue(stored);
    hydrated.current = true;
  }, [key]);

  // Persist on change, skip the first render until we've hydrated
  useEffect(() => {
    if (!hydrated.current) return;
    safeStorage.set(key, value);
  }, [key, value]);

  const reset = useCallback(() => setValue(initialValue), [initialValue]);

  return [value, setValue, reset] as const;
}
