import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parseData } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

/** Counts the caller may not see come back as null, so the tile is hidden. */
const count = z.number().nullable();
const flag = z.boolean().nullable();

const attentionSchema = z.object({
  awaitingApproval: count,
  changesRequested: count,
  failedPosts: count,
  reconnectAccounts: count,
  overdueTasks: count,
});
export type DashboardAttention = z.infer<typeof attentionSchema>;
export type AttentionKey = keyof DashboardAttention;

const setupSchema = z.object({
  hasClient: flag,
  hasAccount: flag,
  hasPost: flag,
  hasTeammate: flag,
  hasTask: flag,
});
export type SetupStep = keyof z.infer<typeof setupSchema>;

/*
 * Both span posts, accounts and tasks, so no single feature's mutation can
 * invalidate them; they're cheap counts, so they refetch whenever the page mounts.
 */

export function useDashboardAttention(clientId?: string) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.dashboard(slug), "attention", clientId ?? null],
    queryFn: async () =>
      parseData(
        attentionSchema,
        (await apiClient.get("/dashboard/attention", { params: { clientId } }))
          .data,
      ),
    staleTime: 0,
    enabled: Boolean(slug),
  });
}

/** Workspace-wide, so it doesn't refetch when the client filter changes. */
export function useDashboardSetup() {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.dashboard(slug), "setup"],
    queryFn: async () =>
      parseData(setupSchema, (await apiClient.get("/dashboard/setup")).data),
    staleTime: 0,
    enabled: Boolean(slug),
  });
}
