import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parseData } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

import { moveInBoard } from "../lib/move-in-board";
import {
  type BoardColumn,
  type TaskFilters,
  type TaskInput,
  taskSchema,
  type TaskStatusInput,
} from "../types";
import { boardQueryKey } from "./get-tasks";

/** Task changes also move column and sprint totals, so those refresh too. */
function useInvalidateTasks() {
  const slug = useActiveWorkspaceSlug() ?? "";
  const queryClient = useQueryClient();
  return async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.tasks(slug) });
    await queryClient.invalidateQueries({
      queryKey: queryKeys.taskStatuses(slug),
    });
    await queryClient.invalidateQueries({ queryKey: queryKeys.sprints(slug) });
  };
}

export function useCreateTask() {
  const onSuccess = useInvalidateTasks();
  return useMutation({
    mutationFn: async (input: TaskInput) =>
      parseData(taskSchema, (await apiClient.post("/tasks", input)).data),
    onSuccess,
  });
}

export function useUpdateTask() {
  const onSuccess = useInvalidateTasks();
  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<TaskInput> & { id: string }) =>
      parseData(
        taskSchema,
        (await apiClient.patch(`/tasks/${id}`, input)).data,
      ),
    onSuccess,
  });
}

export function useDeleteTask() {
  const slug = useActiveWorkspaceSlug() ?? "";
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => apiClient.delete(`/tasks/${taskId}`),
    onSuccess: async (_response, taskId) => {
      // Skip the deleted task's own queries: refetching them would only 404.
      await queryClient.invalidateQueries({
        queryKey: queryKeys.tasks(slug),
        predicate: (query) => !query.queryKey.includes(taskId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.taskStatuses(slug),
      });
    },
  });
}

export interface MoveTaskInput {
  taskId: string;
  statusId: string;
  afterTaskId: string | null;
}

/** Moves the card in the cached board at once and rolls back if the API refuses. */
export function useMoveTask(filters: TaskFilters) {
  const slug = useActiveWorkspaceSlug() ?? "";
  const queryClient = useQueryClient();
  const invalidate = useInvalidateTasks();
  const key = boardQueryKey(slug, filters);
  return useMutation({
    mutationFn: async ({ taskId, ...body }: MoveTaskInput) =>
      parseData(
        taskSchema,
        (await apiClient.post(`/tasks/${taskId}/move`, body)).data,
      ),
    onMutate: async (move) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<BoardColumn[]>(key);
      if (previous) queryClient.setQueryData(key, moveInBoard(previous, move));
      return { previous };
    },
    onError: (_error, _move, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: invalidate,
  });
}

export function useCreateTaskStatus() {
  const onSuccess = useInvalidateTasks();
  return useMutation({
    mutationFn: (input: TaskStatusInput) =>
      apiClient.post("/task-statuses", input),
    onSuccess,
  });
}

export function useUpdateTaskStatus() {
  const onSuccess = useInvalidateTasks();
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<TaskStatusInput> & { id: string }) =>
      apiClient.patch(`/task-statuses/${id}`, input),
    onSuccess,
  });
}

export function useReorderTaskStatuses() {
  const onSuccess = useInvalidateTasks();
  return useMutation({
    mutationFn: (statusIds: string[]) =>
      apiClient.post("/task-statuses/reorder", { statusIds }),
    onSuccess,
  });
}

export function useDeleteTaskStatus() {
  const onSuccess = useInvalidateTasks();
  return useMutation({
    mutationFn: ({
      statusId,
      moveToStatusId,
    }: {
      statusId: string;
      moveToStatusId?: string;
    }) =>
      apiClient.delete(`/task-statuses/${statusId}`, {
        params: { moveToStatusId },
      }),
    onSuccess,
  });
}
