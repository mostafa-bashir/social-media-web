import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parseData } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

import {
  type TaskLabelInput,
  taskLabelWithCountSchema,
  taskSettingsSchema,
} from "../types";

export function useTaskLabels() {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: queryKeys.taskLabels(slug),
    queryFn: async () =>
      parseData(
        z.array(taskLabelWithCountSchema),
        (await apiClient.get("/task-labels")).data,
      ),
    enabled: Boolean(slug),
  });
}

export function useTaskSettings() {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: queryKeys.taskSettings(slug),
    queryFn: async () =>
      parseData(
        taskSettingsSchema,
        (await apiClient.get("/task-settings")).data,
      ),
    enabled: Boolean(slug),
  });
}

/** Labels and keys show on every task, so task queries refresh too. */
function useInvalidateMeta() {
  const slug = useActiveWorkspaceSlug() ?? "";
  const queryClient = useQueryClient();
  return async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.taskLabels(slug),
    });
    await queryClient.invalidateQueries({
      queryKey: queryKeys.taskSettings(slug),
    });
    await queryClient.invalidateQueries({ queryKey: queryKeys.tasks(slug) });
  };
}

export function useCreateTaskLabel() {
  const onSuccess = useInvalidateMeta();
  return useMutation({
    mutationFn: (input: TaskLabelInput) =>
      apiClient.post("/task-labels", input),
    onSuccess,
  });
}

export function useUpdateTaskLabel() {
  const onSuccess = useInvalidateMeta();
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<TaskLabelInput> & { id: string }) =>
      apiClient.patch(`/task-labels/${id}`, input),
    onSuccess,
  });
}

export function useDeleteTaskLabel() {
  const onSuccess = useInvalidateMeta();
  return useMutation({
    mutationFn: (labelId: string) =>
      apiClient.delete(`/task-labels/${labelId}`),
    onSuccess,
  });
}

export function useUpdateTaskSettings() {
  const onSuccess = useInvalidateMeta();
  return useMutation({
    mutationFn: (input: { keyPrefix: string | null }) =>
      apiClient.patch("/task-settings", input),
    onSuccess,
  });
}
