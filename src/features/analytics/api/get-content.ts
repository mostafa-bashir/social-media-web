import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parseData } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

import type { AnalyticsScope } from "../types";
import { contentInsightsSchema, trendsSchema } from "../types/content";

/** Public trend lists change hourly at most (the API caches them that long). */
const TRENDS_STALE_MS = 30 * 60_000;

export function useContentInsights(scope: AnalyticsScope) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.analytics(slug), "content", scope],
    queryFn: async () =>
      parseData(
        contentInsightsSchema,
        (await apiClient.get("/analytics/content", { params: scope })).data,
      ),
    placeholderData: keepPreviousData,
    enabled: Boolean(slug),
  });
}

export function useTrends(scope: AnalyticsScope, country: string | undefined) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.analytics(slug), "trends", scope, country],
    queryFn: async () =>
      parseData(
        trendsSchema,
        (
          await apiClient.get("/analytics/trends", {
            params: { ...scope, country },
          })
        ).data,
      ),
    staleTime: TRENDS_STALE_MS,
    enabled: Boolean(slug && country),
  });
}
