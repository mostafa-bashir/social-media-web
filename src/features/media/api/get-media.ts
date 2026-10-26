import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parsePaginated } from "@/lib/api/api-client";
import { mediaAssetSchema } from "@/lib/media";
import { queryKeys } from "@/lib/query-keys";

import type { MediaQuery } from "../types";

export function useMedia(query: MediaQuery) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.media(slug), "list", query],
    queryFn: async () =>
      parsePaginated(
        mediaAssetSchema,
        (await apiClient.get("/media", { params: query })).data,
      ),
    placeholderData: keepPreviousData,
    enabled: Boolean(slug),
  });
}
