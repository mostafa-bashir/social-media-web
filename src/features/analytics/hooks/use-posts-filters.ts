"use client";

import { useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";

import {
  contentTypeSchema,
  POST_SORTS,
  type PostFilters,
  type PostSort,
} from "../types";

const DEFAULT_SORT: PostSort = "views";

export interface PostsListFilters extends Omit<PostFilters, "search"> {
  sort: PostSort;
}

/** The posts list's own filters, kept in the URL beside the page filters (search stays local). */
export function usePostsFilters() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters: PostsListFilters = {
    accountId: params.get("accountId") ?? undefined,
    contentType: contentTypeSchema.safeParse(params.get("contentType")).data,
    sort:
      POST_SORTS.find((sort) => sort === params.get("sort")) ?? DEFAULT_SORT,
  };

  const update = useCallback(
    (change: Partial<PostsListFilters>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(change)) {
        if (value && !(key === "sort" && value === DEFAULT_SORT)) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
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
