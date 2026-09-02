"use client";

import { useSyncExternalStore } from "react";

/**
 * The timestamp printed on the decision memo.
 *
 * Computing `new Date()` during render would produce one value on the server
 * and another in the browser — a hydration mismatch. Instead the value is read
 * through an external store whose *server* snapshot is empty, and it is
 * refreshed just before the browser paints a print job, so the memo is stamped
 * with when it was actually printed rather than when the page happened to load.
 */

let generatedAt = typeof window === "undefined" ? "" : new Date().toISOString();
const listeners = new Set<() => void>();

function refresh(): void {
  generatedAt = new Date().toISOString();
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("beforeprint", refresh);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("beforeprint", refresh);
  };
}

export function usePrintTimestamp(): string {
  return useSyncExternalStore(
    subscribe,
    () => generatedAt,
    () => "",
  );
}
