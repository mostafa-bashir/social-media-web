import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parseData, parsePaginated } from "@/lib/api/api-client";
import { mediaAssetSchema } from "@/lib/media";
import { queryKeys } from "@/lib/query-keys";

import { composerAccountSchema, postSchema, type PostsQuery } from "../types";

/** While anything is in flight, the detail view refreshes on its own. */
const PUBLISHING_POLL_MS = 4_000;
/** A client rarely has more; the composer shows them all at once. */
const COMPOSER_ACCOUNTS_LIMIT = 100;
export const PICKER_PAGE_SIZE = 12;

export function usePosts(query: PostsQuery) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.posts(slug), "list", query],
    queryFn: async () =>
      parsePaginated(
        postSchema,
        (
          await apiClient.get("/posts", {
            // The API takes several statuses as one comma-separated value.
            params: { ...query, status: query.status?.join(",") || undefined },
          })
        ).data,
      ),
    placeholderData: keepPreviousData,
    enabled: Boolean(slug),
  });
}

export function usePost(postId: string | undefined) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.posts(slug), "detail", postId],
    queryFn: async () =>
      parseData(postSchema, (await apiClient.get(`/posts/${postId}`)).data),
    enabled: Boolean(slug && postId),
    refetchInterval: (query) =>
      query.state.data?.status === "publishing" ? PUBLISHING_POLL_MS : false,
  });
}

/** Own key under the social-accounts prefix, so connect/disconnect refreshes it. */
export function useComposerAccounts(clientId: string | undefined) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.socialAccounts(slug), "composer", clientId],
    queryFn: async () =>
      parsePaginated(
        composerAccountSchema,
        (
          await apiClient.get("/social-accounts", {
            params: { clientId, pageSize: COMPOSER_ACCOUNTS_LIMIT },
          })
        ).data,
      ).data,
    enabled: Boolean(slug && clientId),
  });
}

/** Own key under the media prefix, so uploads anywhere refresh the picker. */
export function useClientMedia(clientId: string | undefined, page: number) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.media(slug), "picker", clientId, page],
    queryFn: async () =>
      parsePaginated(
        mediaAssetSchema,
        (
          await apiClient.get("/media", {
            params: { clientId, page, pageSize: PICKER_PAGE_SIZE },
          })
        ).data,
      ),
    placeholderData: keepPreviousData,
    enabled: Boolean(slug && clientId),
  });
}
