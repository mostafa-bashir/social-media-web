import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parseData } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

import { invitationSchema } from "../types";

/**
 * Member and invitation changes. Invalidates the members / invitations
 * prefixes, which also refreshes the dashboard tiles and role member counts.
 */
function useInvalidate(prefix: "members" | "invitations") {
  const slug = useActiveWorkspaceSlug() ?? "";
  const queryClient = useQueryClient();
  return async () => {
    if (prefix === "members") {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.members(slug),
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.roles(slug) });
    }
    if (prefix === "invitations") {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.invitations(slug),
      });
    }
  };
}

export function useChangeMemberRole() {
  const onSuccess = useInvalidate("members");
  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      apiClient.patch(`/members/${userId}/role`, { roleId }),
    onSuccess,
  });
}

export function useRemoveMember() {
  const onSuccess = useInvalidate("members");
  return useMutation({
    mutationFn: (userId: string) => apiClient.delete(`/members/${userId}`),
    onSuccess,
  });
}

export function useInviteMember() {
  const onSuccess = useInvalidate("invitations");
  return useMutation({
    mutationFn: async (input: { email: string; roleId: string }) =>
      parseData(
        invitationSchema,
        (await apiClient.post("/invitations", input)).data,
      ),
    onSuccess,
  });
}

export function useRevokeInvitation() {
  const onSuccess = useInvalidate("invitations");
  return useMutation({
    mutationFn: (invitationId: string) =>
      apiClient.delete(`/invitations/${invitationId}`),
    onSuccess,
  });
}
