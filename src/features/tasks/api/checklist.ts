import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parseData } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

import { checklistItemSchema } from "../types";

export function useChecklist(taskId: string) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.tasks(slug), "checklist", taskId],
    queryFn: async () =>
      parseData(
        z.array(checklistItemSchema),
        (await apiClient.get(`/tasks/${taskId}/checklist`)).data,
      ),
    enabled: Boolean(slug),
  });
}

/** Cards show checklist progress, so every task query refreshes. */
function useInvalidateTasks() {
  const slug = useActiveWorkspaceSlug() ?? "";
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks(slug) });
}

export function useAddChecklistItem(taskId: string) {
  const onSuccess = useInvalidateTasks();
  return useMutation({
    mutationFn: (text: string) =>
      apiClient.post(`/tasks/${taskId}/checklist`, { text }),
    onSuccess,
  });
}

export function useUpdateChecklistItem(taskId: string) {
  const onSuccess = useInvalidateTasks();
  return useMutation({
    mutationFn: ({
      itemId,
      ...input
    }: {
      itemId: string;
      text?: string;
      done?: boolean;
    }) => apiClient.patch(`/tasks/${taskId}/checklist/${itemId}`, input),
    onSuccess,
  });
}

export function useDeleteChecklistItem(taskId: string) {
  const onSuccess = useInvalidateTasks();
  return useMutation({
    mutationFn: (itemId: string) =>
      apiClient.delete(`/tasks/${taskId}/checklist/${itemId}`),
    onSuccess,
  });
}
