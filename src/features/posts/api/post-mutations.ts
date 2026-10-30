import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parseData } from "@/lib/api/api-client";
import { mediaAssetSchema } from "@/lib/media";
import { queryKeys } from "@/lib/query-keys";

import { type PostInput, postSchema } from "../types";

function useInvalidatePosts() {
  const slug = useActiveWorkspaceSlug() ?? "";
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.posts(slug) });
}

/** Creates a draft, or updates the post when `postId` is given. */
export function useSavePost() {
  const onSuccess = useInvalidatePosts();
  return useMutation({
    mutationFn: async ({
      postId,
      clientId,
      input,
    }: {
      postId?: string;
      clientId: string;
      input: PostInput;
    }) => {
      const response = postId
        ? await apiClient.patch(`/posts/${postId}`, input)
        : await apiClient.post("/posts", { clientId, ...input });
      return parseData(postSchema, response.data);
    },
    onSuccess,
  });
}

/** `kind` is the endpoint under `/posts/:id/`; the rest is the request body. */
export type PostAction =
  | { kind: "schedule"; scheduledAt: string }
  | { kind: "publish-now" }
  | { kind: "unschedule" }
  | { kind: "submit-review"; scheduledAt: string | null }
  | { kind: "withdraw-review" }
  | { kind: "approve"; scheduledAt?: string }
  | { kind: "request-changes"; comment: string };

export function usePostAction() {
  const onSuccess = useInvalidatePosts();
  return useMutation({
    mutationFn: async ({
      postId,
      action,
    }: {
      postId: string;
      action: PostAction;
    }) => {
      const { kind, ...body } = action;
      return parseData(
        postSchema,
        (await apiClient.post(`/posts/${postId}/${kind}`, body)).data,
      );
    },
    onSuccess,
  });
}

export function useRetryTarget() {
  const onSuccess = useInvalidatePosts();
  return useMutation({
    mutationFn: async ({
      postId,
      targetId,
    }: {
      postId: string;
      targetId: string;
    }) =>
      parseData(
        postSchema,
        (await apiClient.post(`/posts/${postId}/targets/${targetId}/retry`))
          .data,
      ),
    onSuccess,
  });
}

export function useDeletePost() {
  const onSuccess = useInvalidatePosts();
  return useMutation({
    mutationFn: (postId: string) => apiClient.delete(`/posts/${postId}`),
    onSuccess,
  });
}

/** Uploading from the composer's picker; the media library has its own. */
export function useUploadPostMedia() {
  const slug = useActiveWorkspaceSlug() ?? "";
  const queryClient = useQueryClient();
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
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.media(slug) }),
  });
}
