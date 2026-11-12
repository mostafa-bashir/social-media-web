import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parseData } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

/** Matches the API's choices. */
export const CONNECT_LINK_EXPIRY_DAYS = [1, 7, 30] as const;

export const connectLinkSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  expiresAt: z.string(),
  revokedAt: z.string().nullable(),
  lastUsedAt: z.string().nullable(),
  createdAt: z.string(),
  active: z.boolean(),
});
export type ConnectLink = z.infer<typeof connectLinkSchema>;

const linksKey = (slug: string, clientId: string) => [
  ...queryKeys.socialAccounts(slug),
  "connect-links",
  clientId,
];

export function useConnectLinks(clientId: string | undefined) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: linksKey(slug, clientId ?? ""),
    queryFn: async () =>
      parseData(
        z.array(connectLinkSchema),
        (
          await apiClient.get("/social-accounts/connect-links", {
            params: { clientId },
          })
        ).data,
      ),
    enabled: Boolean(slug && clientId),
  });
}

export function useCreateConnectLink() {
  const slug = useActiveWorkspaceSlug() ?? "";
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { clientId: string; expiresInDays: number }) =>
      parseData(
        z.object({ link: connectLinkSchema, token: z.string() }),
        (await apiClient.post("/social-accounts/connect-links", input)).data,
      ),
    onSuccess: ({ link }) =>
      queryClient.invalidateQueries({
        queryKey: linksKey(slug, link.clientId),
      }),
  });
}

export function useRevokeConnectLink() {
  const slug = useActiveWorkspaceSlug() ?? "";
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (link: ConnectLink) =>
      apiClient.delete(`/social-accounts/connect-links/${link.id}`),
    onSuccess: (_result, link) =>
      queryClient.invalidateQueries({
        queryKey: linksKey(slug, link.clientId),
      }),
  });
}
