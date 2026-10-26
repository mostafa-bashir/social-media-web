import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parseData } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

import type { AnalyticsScope } from "../types";
import { audienceSchema } from "../types/audience";

export function useAudience(scope: AnalyticsScope) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.analytics(slug), "audience", scope],
    queryFn: async () =>
      parseData(
        audienceSchema,
        (await apiClient.get("/analytics/audience", { params: scope })).data,
      ),
    placeholderData: keepPreviousData,
    enabled: Boolean(slug),
  });
}
