import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { apiClient, parseData } from "@/lib/api/api-client";
import { workspaceSummarySchema } from "@/lib/auth/session-types";

const previewSchema = z.object({
  workspaceName: z.string(),
  workspaceSlug: z.string(),
  email: z.string(),
  inviterName: z.string().nullable(),
  expiresAt: z.string(),
  accountExists: z.boolean(),
});
export type InvitationPreview = z.infer<typeof previewSchema>;

export function useInvitationPreview(token: string) {
  return useQuery({
    queryKey: ["invitation", token],
    queryFn: async () =>
      parseData(
        previewSchema,
        (await apiClient.get(`/invitations/token/${encodeURIComponent(token)}`))
          .data,
      ),
  });
}

export function useAcceptInvitation() {
  return useMutation({
    mutationFn: async (token: string) =>
      parseData(
        workspaceSummarySchema,
        (
          await apiClient.post(
            `/invitations/token/${encodeURIComponent(token)}/accept`,
          )
        ).data,
      ),
  });
}
