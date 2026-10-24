import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parseData, parsePaginated } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

import {
  invitationSchema,
  memberSchema,
  type MembersQuery,
  roleOptionSchema,
} from "../types";

export function useMembers(query: MembersQuery) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.members(slug), "list", query],
    queryFn: async () =>
      parsePaginated(
        memberSchema,
        (
          await apiClient.get("/members", {
            params: { ...query, search: query.search || undefined },
          })
        ).data,
      ),
    placeholderData: keepPreviousData,
    enabled: Boolean(slug),
  });
}

export function usePendingInvitations(enabled: boolean) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.invitations(slug), "pending"],
    queryFn: async () =>
      parseData(
        z.array(invitationSchema),
        (await apiClient.get("/invitations")).data,
      ),
    enabled: enabled && Boolean(slug),
  });
}

/** Roles for the role pickers. Own key under the roles prefix (fana: no cross-feature imports). */
export function useRoleOptions() {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.roles(slug), "options"],
    queryFn: async () =>
      parseData(
        z.array(roleOptionSchema),
        (await apiClient.get("/roles")).data,
      ),
    enabled: Boolean(slug),
  });
}
