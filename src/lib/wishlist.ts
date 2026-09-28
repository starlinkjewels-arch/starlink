// Wishlist ("Saved pieces") and recently viewed products, kept in this browser only.
// Both are features the visitor uses directly, so they count as strictly necessary storage
// (listed in the privacy policy); nothing is sent to a server.
import { useSyncExternalStore } from "react";

const WISHLIST_KEY = "sj_wishlist";
const RECENT_KEY = "sj_recent";
const MAX_WISHLIST = 100;
const MAX_RECENT = 12;

type Listener = () => void;
const listeners = new Set<Listener>();
const cache: Record<string, string[]> = {};

const read = (key: string): string[] => {
  if (cache[key]) return cache[key];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    cache[key] = Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string").slice(0, MAX_WISHLIST) : [];
  } catch {
    cache[key] = [];
  }
  return cache[key];
};

const write = (key: string, ids: string[]) => {
  cache[key] = ids;
  try {
    window.localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    // storage blocked: keep working in memory for this visit
  }
  listeners.forEach((fn) => fn());
};

// Keep several tabs in sync.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === WISHLIST_KEY || e.key === RECENT_KEY) {
      delete cache[e.key];
      listeners.forEach((fn) => fn());
    }
  });
}

const subscribe = (fn: Listener) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

// ---- Wishlist ----
export const getWishlist = () => read(WISHLIST_KEY);
export const isSaved = (id: string) => read(WISHLIST_KEY).includes(id);
export const toggleSaved = (id: string) => {
  const ids = read(WISHLIST_KEY);
  const next = ids.includes(id) ? ids.filter((x) => x !== id) : [id, ...ids].slice(0, MAX_WISHLIST);
  write(WISHLIST_KEY, next);
  return next.includes(id);
};
export const addManyToWishlist = (add: string[]) => write(WISHLIST_KEY, Array.from(new Set([...add, ...read(WISHLIST_KEY)])).slice(0, MAX_WISHLIST));
export const clearWishlist = () => write(WISHLIST_KEY, []);

export const useWishlist = () => useSyncExternalStore(subscribe, () => read(WISHLIST_KEY), () => [] as string[]);

// ---- Recently viewed ----
export const recordRecentlyViewed = (id: string) => write(RECENT_KEY, [id, ...read(RECENT_KEY).filter((x) => x !== id)].slice(0, MAX_RECENT));
export const useRecentlyViewed = () => useSyncExternalStore(subscribe, () => read(RECENT_KEY), () => [] as string[]);
