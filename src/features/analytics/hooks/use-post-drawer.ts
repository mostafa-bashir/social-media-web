"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";

import type { PostRef } from "../api/get-analytics";
import { POST_SOURCES } from "../types";

const POST_PARAM = "post";
const SEPARATOR = ":";

/** The post open in the analytics drawer, kept in `?post=source:id` so it can be linked. */
export function usePostDrawer() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const raw = params.get(POST_PARAM);

  const openPost = useMemo<PostRef | null>(() => {
    const [source, id] = raw?.split(SEPARATOR) ?? [];
    const known = POST_SOURCES.find((value) => value === source);
    return known && id ? { source: known, id } : null;
  }, [raw]);

  const setPost = useCallback(
    (ref: PostRef | null) => {
      const next = new URLSearchParams(params.toString());
      if (ref) next.set(POST_PARAM, `${ref.source}${SEPARATOR}${ref.id}`);
      else next.delete(POST_PARAM);
      router.replace(
        { pathname, query: Object.fromEntries(next) },
        { scroll: false },
      );
    },
    [params, pathname, router],
  );

  return {
    openPost,
    open: setPost,
    close: useCallback(() => setPost(null), [setPost]),
  };
}
