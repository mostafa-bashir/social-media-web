import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { z } from "zod";

import { useActiveWorkspaceSlug, workspaceKeys } from "@/features/workspaces";
import { apiClient, parseData, parsePaginated } from "@/lib/api/api-client";

const memberSchema = z.object({
  userId: z.string(),
  name: z.string(),
  email: z.string(),
  avatarUrl: z.string().nullable(),
  role: z.object({ id: z.string(), name: z.string(), slug: z.string() }),
  jobTitle: z.string().nullable(),
  isOwner: z.boolean(),
  joinedAt: z.string(),
});
export type Member = z.infer<typeof memberSchema>;

const invitationSchema = z.object({
  id: z.string(),
  email: z.string(),
  roleId: z.string(),
  invitedBy: z.string().nullable(),
  expiresAt: z.string(),
  createdAt: z.string(),
});
export type Invitation = z.infer<typeof invitationSchema>;

export interface MembersQuery {
  page: number;
  pageSize: number;
  search?: string;
}

function memberKeys(slug: string) {
  const scope = workspaceKeys.scope(slug);
  return {
    all: [...scope, "members"] as const,
    list: (query: MembersQuery) => [...scope, "members", query] as const,
    invitations: [...scope, "invitations"] as const,
  };
}

function useKeys() {
  return memberKeys(useActiveWorkspaceSlug() ?? "");
}

export function useMembers(query: MembersQuery) {
  const keys = useKeys();
  return useQuery({
    queryKey: keys.list(query),
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
  });
}

export function useChangeMemberRole() {
  const keys = useKeys();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      apiClient.patch(`/members/${userId}/role`, { roleId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useRemoveMember() {
  const keys = useKeys();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => apiClient.delete(`/members/${userId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useInvitations(enabled: boolean) {
  const keys = useKeys();
  return useQuery({
    queryKey: keys.invitations,
    queryFn: async () =>
      parseData(
        z.array(invitationSchema),
        (await apiClient.get("/invitations")).data,
      ),
    enabled,
  });
}

export function useInviteMember() {
  const keys = useKeys();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { email: string; roleId: string }) =>
      parseData(
        invitationSchema,
        (await apiClient.post("/invitations", input)).data,
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: keys.invitations }),
  });
}

export function useRevokeInvitation() {
  const keys = useKeys();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) =>
      apiClient.delete(`/invitations/${invitationId}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: keys.invitations }),
  });
}
