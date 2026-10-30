import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parseData, parsePaginated } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

import {
  type LinkKind,
  taskActivitySchema,
  taskAttachmentSchema,
  taskLinkSchema,
  taskPersonSchema,
  taskWorklogSchema,
  type WorklogInput,
} from "../types";

const HISTORY_PAGE_SIZE = 50;

type Part = "watchers" | "activity" | "links" | "attachments" | "worklogs";

/** Every per-task panel lives under the tasks key, so task changes refresh them too. */
function useTaskKey() {
  const slug = useActiveWorkspaceSlug() ?? "";
  return {
    slug,
    key: (part: Part, taskId: string) =>
      [...queryKeys.tasks(slug), part, taskId] as const,
  };
}

/** Panels change the task's history and counters: refresh every task view. */
function useRefreshTasks() {
  const slug = useActiveWorkspaceSlug() ?? "";
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks(slug) });
}

function useList<T extends z.ZodTypeAny>(
  part: Part,
  taskId: string,
  schema: T,
) {
  const { slug, key } = useTaskKey();
  return useQuery({
    queryKey: key(part, taskId),
    queryFn: async () =>
      parseData(
        z.array(schema),
        (await apiClient.get(`/tasks/${taskId}/${part}`)).data,
      ),
    enabled: Boolean(slug),
  });
}

export const useWatchers = (taskId: string) =>
  useList("watchers", taskId, taskPersonSchema);
export const useTaskLinks = (taskId: string) =>
  useList("links", taskId, taskLinkSchema);
export const useAttachments = (taskId: string) =>
  useList("attachments", taskId, taskAttachmentSchema);
export const useWorklogs = (taskId: string) =>
  useList("worklogs", taskId, taskWorklogSchema);

export function useTaskHistory(taskId: string) {
  const { slug, key } = useTaskKey();
  return useQuery({
    queryKey: key("activity", taskId),
    queryFn: async () =>
      parsePaginated(
        taskActivitySchema,
        (
          await apiClient.get(`/tasks/${taskId}/activity`, {
            params: { pageSize: HISTORY_PAGE_SIZE },
          })
        ).data,
      ),
    enabled: Boolean(slug),
  });
}

export function useToggleWatch(taskId: string) {
  const onSuccess = useRefreshTasks();
  return useMutation({
    mutationFn: (watch: boolean) =>
      watch
        ? apiClient.post(`/tasks/${taskId}/watchers/me`)
        : apiClient.delete(`/tasks/${taskId}/watchers/me`),
    onSuccess,
  });
}

export function useCreateLink(taskId: string) {
  const onSuccess = useRefreshTasks();
  return useMutation({
    mutationFn: (input: { kind: LinkKind; targetTaskId: string }) =>
      apiClient.post(`/tasks/${taskId}/links`, input),
    onSuccess,
  });
}

export function useDeleteLink(taskId: string) {
  const onSuccess = useRefreshTasks();
  return useMutation({
    mutationFn: (linkId: string) =>
      apiClient.delete(`/tasks/${taskId}/links/${linkId}`),
    onSuccess,
  });
}

export function useUploadAttachment(taskId: string) {
  const onSuccess = useRefreshTasks();
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append("file", file);
      // The client defaults to JSON; multipart needs saying explicitly.
      return apiClient.post(`/tasks/${taskId}/attachments`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess,
  });
}

export function useDeleteAttachment(taskId: string) {
  const onSuccess = useRefreshTasks();
  return useMutation({
    mutationFn: (attachmentId: string) =>
      apiClient.delete(`/tasks/${taskId}/attachments/${attachmentId}`),
    onSuccess,
  });
}

export function useLogTime(taskId: string) {
  const onSuccess = useRefreshTasks();
  return useMutation({
    mutationFn: (input: WorklogInput) =>
      apiClient.post(`/tasks/${taskId}/worklogs`, input),
    onSuccess,
  });
}

export function useDeleteWorklog(taskId: string) {
  const onSuccess = useRefreshTasks();
  return useMutation({
    mutationFn: (worklogId: string) =>
      apiClient.delete(`/tasks/${taskId}/worklogs/${worklogId}`),
    onSuccess,
  });
}
