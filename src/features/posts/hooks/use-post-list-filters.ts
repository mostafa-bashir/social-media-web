"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";

import { POST_STATUSES, type PostStatus } from "../types";

export interface PostListFilters {
  clientId?: string;
  status: PostStatus[];
}

/**
 * Client and status filters, kept in the URL (`?clientId=`, `?status=a,b`) so
 * links from the dashboard land filtered and reloads or shared links keep them.
 */
export function usePostListFilters() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo<PostListFilters>(() => {
    const requested = params.get("status")?.split(",") ?? [];
    return {
      clientId: params.get("clientId") ?? undefined,
      status: POST_STATUSES.filter((value) => requested.includes(value)),
    };
  }, [params]);

  const update = useCallback(
    (change: Partial<PostListFilters>) => {
      const next = new URLSearchParams(params.toString());
      if ("clientId" in change) {
        if (change.clientId) next.set("clientId", change.clientId);
        else next.delete("clientId");
      }
      if (change.status) {
        if (change.status.length) next.set("status", change.status.join(","));
        else next.delete("status");
      }
      router.replace(
        { pathname, query: Object.fromEntries(next) },
        { scroll: false },
      );
    },
    [params, pathname, router],
  );

  return { filters, update };
}
