import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parseData, parsePaginated } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

import {
  type AnalyticsScope,
  analyticsPostSchema,
  overviewSchema,
  type PostSort,
  timeseriesSchema,
  type TrendMetric,
} from "../types";

/** Figures change only when the background sync runs (every few hours). */
const ANALYTICS_STALE_MS = 5 * 60_000;

function useAnalyticsQuery<T>(key: unknown[], fetch: () => Promise<T>) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.analytics(slug), ...key],
    queryFn: fetch,
    placeholderData: keepPreviousData,
    staleTime: ANALYTICS_STALE_MS,
    enabled: Boolean(slug),
  });
}

export function useAnalyticsOverview(scope: AnalyticsScope) {
  return useAnalyticsQuery(["overview", scope], async () =>
    parseData(
      overviewSchema,
      (await apiClient.get("/analytics/overview", { params: scope })).data,
    ),
  );
}

export function useAnalyticsTimeseries(
  scope: AnalyticsScope,
  metric: TrendMetric,
) {
  return useAnalyticsQuery(["timeseries", scope, metric], async () =>
    parseData(
      timeseriesSchema,
      (
        await apiClient.get("/analytics/timeseries", {
          params: { ...scope, metric, groupBy: "platform" },
        })
      ).data,
    ),
  );
}

export function useAnalyticsPosts(
  scope: AnalyticsScope,
  sort: PostSort,
  page: number,
  pageSize: number,
) {
  return useAnalyticsQuery(["posts", scope, sort, page], async () =>
    parsePaginated(
      analyticsPostSchema,
      (
        await apiClient.get("/analytics/posts", {
          params: { ...scope, sort, page, pageSize },
        })
      ).data,
    ),
  );
}
