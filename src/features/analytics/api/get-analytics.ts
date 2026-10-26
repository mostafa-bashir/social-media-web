import { keepPreviousData, useQueries, useQuery } from "@tanstack/react-query";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parseData, parsePaginated } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

import {
  type AnalyticsScope,
  analyticsPostSchema,
  type CompareMode,
  type Granularity,
  overviewSchema,
  postDetailSchema,
  type PostFilters,
  type PostSort,
  type PostSource,
  timeseriesSchema,
  type TrendGroup,
  type TrendMetric,
} from "../types";

/** Figures change only when the background sync runs (every few hours). */
const ANALYTICS_STALE_MS = 5 * 60_000;

function useAnalyticsQuery<T>(
  key: unknown[],
  fetch: () => Promise<T>,
  enabled = true,
) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.analytics(slug), ...key],
    queryFn: fetch,
    placeholderData: keepPreviousData,
    staleTime: ANALYTICS_STALE_MS,
    enabled: Boolean(slug) && enabled,
  });
}

export function useAnalyticsOverview(
  scope: AnalyticsScope,
  compare: CompareMode,
) {
  return useAnalyticsQuery(["overview", scope, compare], async () =>
    parseData(
      overviewSchema,
      (
        await apiClient.get("/analytics/overview", {
          params: { ...scope, compare },
        })
      ).data,
    ),
  );
}

export interface TimeseriesRequest {
  metric: TrendMetric;
  groupBy: TrendGroup;
  granularity: Granularity;
  compare: CompareMode;
}

export function useAnalyticsTimeseries(
  scope: AnalyticsScope,
  request: TimeseriesRequest,
) {
  return useAnalyticsQuery(["timeseries", scope, request], async () =>
    parseData(
      timeseriesSchema,
      (
        await apiClient.get("/analytics/timeseries", {
          params: { ...scope, ...request },
        })
      ).data,
    ),
  );
}

/**
 * One total series per metric (no comparison), fetched in parallel; for
 * charts that put several metrics side by side.
 */
export function useMetricSeries(
  scope: AnalyticsScope,
  metrics: readonly TrendMetric[],
  granularity: Granularity,
) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQueries({
    queries: metrics.map((metric) => {
      const request: TimeseriesRequest = {
        metric,
        groupBy: "total",
        granularity,
        compare: "none",
      };
      return {
        queryKey: [...queryKeys.analytics(slug), "timeseries", scope, request],
        queryFn: async () =>
          parseData(
            timeseriesSchema,
            (
              await apiClient.get("/analytics/timeseries", {
                params: { ...scope, ...request },
              })
            ).data,
          ),
        placeholderData: keepPreviousData,
        staleTime: ANALYTICS_STALE_MS,
        enabled: Boolean(slug),
      };
    }),
  });
}

export interface PostsRequest extends PostFilters {
  sort: PostSort;
  page: number;
  pageSize: number;
}

export function useAnalyticsPosts(
  scope: AnalyticsScope,
  request: PostsRequest,
) {
  return useAnalyticsQuery(["posts", scope, request], async () =>
    parsePaginated(
      analyticsPostSchema,
      (
        await apiClient.get("/analytics/posts", {
          params: { ...scope, ...request },
        })
      ).data,
    ),
  );
}

export interface PostRef {
  source: PostSource;
  id: string;
}

export function useAnalyticsPost(ref: PostRef | null) {
  return useAnalyticsQuery(
    ["post", ref],
    async () =>
      parseData(
        postDetailSchema,
        (await apiClient.get(`/analytics/posts/${ref?.source}/${ref?.id}`))
          .data,
      ),
    ref !== null,
  );
}
