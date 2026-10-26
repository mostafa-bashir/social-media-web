import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parseData } from "@/lib/api/api-client";
import { mediaAssetSchema } from "@/lib/media";
import { queryKeys } from "@/lib/query-keys";

function useInvalidateMedia() {
  const slug = useActiveWorkspaceSlug() ?? "";
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.media(slug) });
}

export function useUploadMedia() {
  const onSuccess = useInvalidateMedia();
  return useMutation({
    mutationFn: async ({
      clientId,
      file,
    }: {
      clientId: string;
      file: File;
    }) => {
      const body = new FormData();
      body.append("clientId", clientId);
      body.append("file", file);
      return parseData(
        mediaAssetSchema,
        (
          await apiClient.post("/media", body, {
            headers: { "Content-Type": "multipart/form-data" },
          })
        ).data,
      );
    },
    onSuccess,
  });
}

export function useDeleteMedia() {
  const onSuccess = useInvalidateMedia();
  return useMutation({
    mutationFn: (mediaId: string) => apiClient.delete(`/media/${mediaId}`),
    onSuccess,
  });
}
