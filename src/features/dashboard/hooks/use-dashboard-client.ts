"use client";

import { useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";

const CLIENT_PARAM = "clientId";

/** Carries the dashboard's client scope onto a list link (`path` may have a query). */
export function withClient(path: string, clientId?: string): string {
  if (!clientId) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}${CLIENT_PARAM}=${encodeURIComponent(clientId)}`;
}

/** The client the whole dashboard is scoped to, kept in the URL so it can be shared. */
export function useDashboardClient() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const clientId = params.get(CLIENT_PARAM) ?? undefined;

  const setClientId = useCallback(
    (next?: string) => {
      const query = new URLSearchParams(params.toString());
      if (next) query.set(CLIENT_PARAM, next);
      else query.delete(CLIENT_PARAM);
      router.replace(
        { pathname, query: Object.fromEntries(query) },
        { scroll: false },
      );
    },
    [params, pathname, router],
  );

  return { clientId, setClientId };
}
