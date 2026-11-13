import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { z } from "zod";

import { adminClient } from "@/lib/api/admin-client";
import { parseData } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

import { failedJobsPageSchema, healthOverviewSchema } from "../types/health";

/** The page stays open on a wall screen: keep it current without a reload. */
const HEALTH_REFRESH_MS = 30_000;

export function useHealthOverview() {
  return useQuery({
    queryKey: [...queryKeys.admin.health, "overview"],
    queryFn: async () =>
      parseData(healthOverviewSchema, (await adminClient.get("/health")).data),
    refetchInterval: HEALTH_REFRESH_MS,
  });
}

export function useFailedJobs(queue: string | null, page: number) {
  return useQuery({
    queryKey: [...queryKeys.admin.health, "failed", queue, page],
    queryFn: async () =>
      parseData(
        failedJobsPageSchema,
        (
          await adminClient.get(`/health/queues/${queue}/failed`, {
            params: { page },
          })
        ).data,
      ),
    enabled: queue !== null,
    placeholderData: keepPreviousData,
  });
}

function useInvalidateHealth() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.health }),
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.auditLog }),
    ]);
}

export function useJobAction(queue: string) {
  const invalidate = useInvalidateHealth();
  return useMutation({
    mutationFn: async ({
      jobId,
      action,
    }: {
      jobId: string;
      action: "retry" | "remove";
    }) => {
      const path = `/health/queues/${queue}/jobs/${encodeURIComponent(jobId)}`;
      await (action === "retry"
        ? adminClient.post(`${path}/retry`)
        : adminClient.delete(path));
    },
    onSuccess: invalidate,
  });
}

/** Queues pending workspace database updates on the worker. */
export function useRunMigrations() {
  const invalidate = useInvalidateHealth();
  return useMutation({
    mutationFn: async () =>
      parseData(
        z.object({ queued: z.boolean() }),
        (await adminClient.post("/health/migrations/run")).data,
      ),
    onSuccess: invalidate,
  });
}
