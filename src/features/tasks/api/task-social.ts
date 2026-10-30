import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { z } from "zod";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parseData, parsePaginated } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

import {
  type AutomationRule,
  automationRuleSchema,
  type TaskGoalInput,
  taskPostSchema,
  taskSchema,
} from "../types";

const POST_OPTIONS_PAGE_SIZE = 50;

/** Recent posts of a client to link; the tasks feature reads `/posts` itself (features stay apart). */
export function usePostOptions(clientId: string | undefined) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.posts(slug), "task-options", clientId],
    queryFn: async () =>
      parsePaginated(
        taskPostSchema
          .pick({
            id: true,
            status: true,
            scheduledAt: true,
            clientId: true,
          })
          .extend({ caption: z.string() }),
        (
          await apiClient.get("/posts", {
            params: { clientId, pageSize: POST_OPTIONS_PAGE_SIZE },
          })
        ).data,
      ),
    placeholderData: keepPreviousData,
    enabled: Boolean(slug),
  });
}

/** Linking and goals change the task, its stage and maybe its column: refresh every task view. */
function useTaskChange() {
  const slug = useActiveWorkspaceSlug() ?? "";
  const queryClient = useQueryClient();
  return async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.tasks(slug) });
    await queryClient.invalidateQueries({
      queryKey: queryKeys.taskStatuses(slug),
    });
  };
}

export function useLinkTaskPost(taskId: string) {
  const onSuccess = useTaskChange();
  return useMutation({
    mutationFn: async (postId: string) =>
      parseData(
        taskSchema,
        (await apiClient.post(`/tasks/${taskId}/posts`, { postId })).data,
      ),
    onSuccess,
  });
}

export function useUnlinkTaskPost(taskId: string) {
  const onSuccess = useTaskChange();
  return useMutation({
    mutationFn: (postId: string) =>
      apiClient.delete(`/tasks/${taskId}/posts/${postId}`),
    onSuccess,
  });
}

export function useAddTaskGoal(taskId: string) {
  const onSuccess = useTaskChange();
  return useMutation({
    mutationFn: (input: TaskGoalInput) =>
      apiClient.post(`/tasks/${taskId}/goals`, input),
    onSuccess,
  });
}

export function useDeleteTaskGoal(taskId: string) {
  const onSuccess = useTaskChange();
  return useMutation({
    mutationFn: (goalId: string) =>
      apiClient.delete(`/tasks/${taskId}/goals/${goalId}`),
    onSuccess,
  });
}

export function useAutomationRules() {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: queryKeys.taskAutomationRules(slug),
    queryFn: async () =>
      parseData(
        z.array(automationRuleSchema),
        (await apiClient.get("/task-automation-rules")).data,
      ),
    enabled: Boolean(slug),
  });
}

export function useUpdateAutomationRules() {
  const slug = useActiveWorkspaceSlug() ?? "";
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rules: AutomationRule[]) =>
      parseData(
        z.array(automationRuleSchema),
        (await apiClient.put("/task-automation-rules", { rules })).data,
      ),
    onSuccess: (rules) =>
      queryClient.setQueryData(queryKeys.taskAutomationRules(slug), rules),
  });
}
