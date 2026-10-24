import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

const countSchema = z.object({ meta: z.object({ total: z.number() }) });
const listSchema = z.object({ data: z.array(z.unknown()) });

/**
 * Workspace KPIs for the dashboard. Keys sit under the members / invitations /
 * roles prefixes so mutations in those features refresh the tiles too.
 */
export function useMemberCount(enabled: boolean) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.members(slug), "count"],
    queryFn: async () =>
      countSchema.parse(
        (await apiClient.get("/members", { params: { pageSize: 1 } })).data,
      ).meta.total,
    enabled: enabled && Boolean(slug),
  });
}

export function usePendingInvitationCount(enabled: boolean) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.invitations(slug), "count"],
    queryFn: async () =>
      listSchema.parse((await apiClient.get("/invitations")).data).data.length,
    enabled: enabled && Boolean(slug),
  });
}

export function useRoleCount(enabled: boolean) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.roles(slug), "count"],
    queryFn: async () =>
      listSchema.parse((await apiClient.get("/roles")).data).data.length,
    enabled: enabled && Boolean(slug),
  });
}
