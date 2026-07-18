/**
 * Tiny typed localStorage wrapper.
 * Returns null on the server (or when storage is unavailable),
 * so callers can safely hydrate from defaults.
 */

const isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export const safeStorage = {
  get<T>(key: string): T | null {
    if (!isBrowser()) return null;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch (err) {
      console.warn(`[safeStorage] failed to read "${key}"`, err);
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    if (!isBrowser()) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`[safeStorage] failed to write "${key}"`, err);
    }
  },

  remove(key: string): void {
    if (!isBrowser()) return;
    try {
      window.localStorage.removeItem(key);
    } catch (err) {
      console.warn(`[safeStorage] failed to remove "${key}"`, err);
    }
  },
};
