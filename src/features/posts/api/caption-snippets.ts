import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parseData } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

import { type CaptionSnippetInput, captionSnippetSchema } from "../types";

/** The client's snippets plus the workspace-wide ones. */
export function useCaptionSnippets(clientId?: string) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.captionSnippets(slug), clientId],
    enabled: Boolean(slug && clientId),
    queryFn: async () =>
      parseData(
        z.array(captionSnippetSchema),
        (await apiClient.get("/caption-snippets", { params: { clientId } }))
          .data,
      ),
  });
}

function useInvalidateSnippets() {
  const slug = useActiveWorkspaceSlug() ?? "";
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.captionSnippets(slug),
    });
}

/** Creates a snippet, or updates it when `snippetId` is given. */
export function useSaveSnippet() {
  const onSuccess = useInvalidateSnippets();
  return useMutation({
    mutationFn: async ({
      snippetId,
      input,
    }: {
      snippetId?: string;
      input: CaptionSnippetInput;
    }) => {
      const response = snippetId
        ? await apiClient.patch(`/caption-snippets/${snippetId}`, {
            kind: input.kind,
            name: input.name,
            body: input.body,
          })
        : await apiClient.post("/caption-snippets", input);
      return parseData(captionSnippetSchema, response.data);
    },
    onSuccess,
  });
}

export function useDeleteSnippet() {
  const onSuccess = useInvalidateSnippets();
  return useMutation({
    mutationFn: (snippetId: string) =>
      apiClient.delete(`/caption-snippets/${snippetId}`),
    onSuccess,
  });
}
