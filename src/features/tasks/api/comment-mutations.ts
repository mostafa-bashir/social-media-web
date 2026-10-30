import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

import type { CommentInput } from "../types";

/** Comment counts show on cards, so the whole tasks tree refreshes. */
function useInvalidateTasks() {
  const slug = useActiveWorkspaceSlug() ?? "";
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks(slug) });
}

export function useAddComment(taskId: string) {
  const onSuccess = useInvalidateTasks();
  return useMutation({
    mutationFn: (input: CommentInput) =>
      apiClient.post(`/tasks/${taskId}/comments`, input),
    onSuccess,
  });
}

export function useEditComment(taskId: string) {
  const onSuccess = useInvalidateTasks();
  return useMutation({
    mutationFn: ({
      commentId,
      ...input
    }: CommentInput & { commentId: string }) =>
      apiClient.patch(`/tasks/${taskId}/comments/${commentId}`, input),
    onSuccess,
  });
}

export function useDeleteComment(taskId: string) {
  const onSuccess = useInvalidateTasks();
  return useMutation({
    mutationFn: (commentId: string) =>
      apiClient.delete(`/tasks/${taskId}/comments/${commentId}`),
    onSuccess,
  });
}
