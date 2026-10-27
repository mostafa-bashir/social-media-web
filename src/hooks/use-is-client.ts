"use client";

import { useSyncExternalStore } from "react";

const noSubscription = () => () => {};

/**
 * `false` on the server and while hydrating, `true` after. Gate UI that
 * depends on client-only data (e.g. permissions fetched in the browser) on
 * it, so the first client render matches the server's HTML.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );
}
