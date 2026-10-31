import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parseData } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

import {
  importResultSchema,
  type PostingSlot,
  postingSlotsSchema,
} from "../types";

export function usePostingSlots(clientId?: string) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.postingSlots(slug), clientId],
    enabled: Boolean(slug && clientId),
    queryFn: async () =>
      parseData(
        postingSlotsSchema,
        (await apiClient.get(`/clients/${clientId}/posting-slots`)).data,
      ),
  });
}

/** Replaces the client's whole week of posting times. */
export function useSavePostingSlots() {
  const slug = useActiveWorkspaceSlug() ?? "";
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      clientId,
      slots,
    }: {
      clientId: string;
      slots: PostingSlot[];
    }) =>
      parseData(
        postingSlotsSchema,
        (await apiClient.put(`/clients/${clientId}/posting-slots`, { slots }))
          .data,
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.postingSlots(slug),
      }),
  });
}

/** `dryRun` checks the rows only; otherwise posts are created when all pass. */
export function useImportPosts() {
  const slug = useActiveWorkspaceSlug() ?? "";
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      clientId,
      file,
      dryRun,
    }: {
      clientId: string;
      file: File;
      dryRun: boolean;
    }) => {
      const body = new FormData();
      body.append("clientId", clientId);
      body.append("file", file);
      return parseData(
        importResultSchema,
        (
          await apiClient.post("/posts/import", body, {
            params: dryRun ? { dryRun: "true" } : {},
            headers: { "Content-Type": "multipart/form-data" },
          })
        ).data,
      );
    },
    onSuccess: (_, { dryRun }) =>
      dryRun
        ? undefined
        : queryClient.invalidateQueries({ queryKey: queryKeys.posts(slug) }),
  });
}
