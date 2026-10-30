"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parsePaginated } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

const LINKED_TASKS_PAGE_SIZE = 20;

/** The slice of a task that other features show; the tasks feature owns the full shape. */
const linkedTaskSchema = z.object({
  id: z.string(),
  key: z.string(),
  title: z.string(),
  workflowStage: z.string().nullable(),
  completedAt: z.string().nullable(),
});
export type LinkedTask = z.infer<typeof linkedTaskSchema>;

/** Tasks that produce or track a post (shared so the posts feature needn't import tasks). */
export function usePostTasks(postId: string | undefined, enabled = true) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.tasks(slug), "by-post", postId],
    queryFn: async () =>
      parsePaginated(
        linkedTaskSchema,
        (
          await apiClient.get("/tasks", {
            params: { postId, pageSize: LINKED_TASKS_PAGE_SIZE },
          })
        ).data,
      ).data,
    enabled: Boolean(slug && postId) && enabled,
  });
}

/** Links a freshly saved post to the task it was created from. */
export function useLinkPostToTask() {
  const slug = useActiveWorkspaceSlug() ?? "";
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, postId }: { taskId: string; postId: string }) =>
      apiClient.post(`/tasks/${taskId}/posts`, { postId }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks(slug) }),
  });
}
