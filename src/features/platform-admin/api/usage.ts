import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { z } from "zod";

import { adminClient } from "@/lib/api/admin-client";
import { parseData, parsePaginated } from "@/lib/api/api-client";
import { filenameFrom, saveBlob } from "@/lib/download";
import { queryKeys } from "@/lib/query-keys";

import {
  tenantUsageRowSchema,
  tenantUsageSeriesSchema,
  type UsageRange,
  type UsageSort,
  usageOverviewSchema,
} from "../types/usage";

export function useUsageOverview(days: UsageRange) {
  return useQuery({
    queryKey: [...queryKeys.admin.usage, "overview", days],
    queryFn: async () =>
      parseData(
        usageOverviewSchema,
        (await adminClient.get("/usage/overview", { params: { days } })).data,
      ),
    placeholderData: keepPreviousData,
  });
}

export interface TenantUsageFilters {
  days: UsageRange;
  page: number;
  pageSize: number;
  search?: string;
  sort: UsageSort;
}

function filterParams(filters: Omit<TenantUsageFilters, "page" | "pageSize">) {
  return {
    days: filters.days,
    search: filters.search || undefined,
    sort: filters.sort,
  };
}

export function useTenantUsage(filters: TenantUsageFilters) {
  return useQuery({
    queryKey: [...queryKeys.admin.usage, "tenants", filters],
    queryFn: async () =>
      parsePaginated(
        tenantUsageRowSchema,
        (
          await adminClient.get("/usage/tenants", {
            params: {
              ...filterParams(filters),
              page: filters.page,
              pageSize: filters.pageSize,
            },
          })
        ).data,
      ),
    placeholderData: keepPreviousData,
  });
}

export function useTenantUsageSeries(tenantId: string, days: UsageRange) {
  return useQuery({
    queryKey: [...queryKeys.admin.usage, "tenant", tenantId, days],
    queryFn: async () =>
      parseData(
        tenantUsageSeriesSchema,
        (
          await adminClient.get(`/usage/tenants/${tenantId}`, {
            params: { days },
          })
        ).data,
      ),
    placeholderData: keepPreviousData,
  });
}

/** Downloads the CSV through the authenticated client, then saves it. */
export async function downloadUsageCsv(
  filters: Omit<TenantUsageFilters, "page" | "pageSize">,
): Promise<void> {
  const response = await adminClient.get<Blob>("/usage/tenants/export", {
    params: filterParams(filters),
    responseType: "blob",
  });
  saveBlob(
    response.data,
    filenameFrom(
      response.headers["content-disposition"],
      `workspace-usage-${filters.days}d.csv`,
    ),
  );
}

/** The worker usually finishes a snapshot well within this; then reload the numbers. */
const SNAPSHOT_SETTLE_MS = 20_000;

/** Queues a snapshot on the worker; `queued: false` means one is already running. */
export function useRefreshUsage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      parseData(
        z.object({ queued: z.boolean() }),
        (await adminClient.post("/usage/refresh")).data,
      ),
    onSuccess: async () => {
      window.setTimeout(
        () =>
          void queryClient.invalidateQueries({
            queryKey: queryKeys.admin.usage,
          }),
        SNAPSHOT_SETTLE_MS,
      );
      await queryClient.invalidateQueries({
        queryKey: queryKeys.admin.auditLog,
      });
    },
  });
}
