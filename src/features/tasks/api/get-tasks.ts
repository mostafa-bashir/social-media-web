import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parseData, parsePaginated } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

import {
  boardColumnSchema,
  taskCommentSchema,
  type TaskFilters,
  taskSchema,
  type TaskType,
  taskStatusSchema,
} from "../types";

const COMMENTS_PAGE_SIZE = 100;

const filterParams = (filters: TaskFilters) => ({
  ...filters,
  search: filters.search || undefined,
});

export function useTaskStatuses() {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: queryKeys.taskStatuses(slug),
    queryFn: async () =>
      parseData(
        z.array(taskStatusSchema),
        (await apiClient.get("/task-statuses")).data,
      ),
    enabled: Boolean(slug),
  });
}

export function boardQueryKey(slug: string, filters: TaskFilters) {
  return [...queryKeys.tasks(slug), "board", filters] as const;
}

export function useTaskBoard(filters: TaskFilters) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: boardQueryKey(slug, filters),
    queryFn: async () =>
      parseData(
        z.array(boardColumnSchema),
        (
          await apiClient.get("/tasks/board", {
            params: filterParams(filters),
          })
        ).data,
      ),
    placeholderData: keepPreviousData,
    enabled: Boolean(slug),
  });
}

export function useTasks(
  query: TaskFilters & { page: number; pageSize: number },
) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.tasks(slug), "list", query],
    queryFn: async () =>
      parsePaginated(
        taskSchema,
        (await apiClient.get("/tasks", { params: filterParams(query) })).data,
      ),
    placeholderData: keepPreviousData,
    enabled: Boolean(slug),
  });
}

export function useTask(taskId: string | undefined) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.tasks(slug), "detail", taskId],
    queryFn: async () =>
      parseData(taskSchema, (await apiClient.get(`/tasks/${taskId}`)).data),
    enabled: Boolean(slug && taskId),
  });
}

export function useTaskComments(taskId: string | undefined) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.tasks(slug), "comments", taskId],
    queryFn: async () =>
      parsePaginated(
        taskCommentSchema,
        (
          await apiClient.get(`/tasks/${taskId}/comments`, {
            params: { pageSize: COMMENTS_PAGE_SIZE },
          })
        ).data,
      ),
    enabled: Boolean(slug && taskId),
  });
}

const CHILDREN_PAGE_SIZE = 100;
const PARENT_OPTIONS_PAGE_SIZE = 20;

/** Subtasks of a task, or the items of a campaign. */
export function useTaskChildren(parentId: string) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.tasks(slug), "children", parentId],
    queryFn: async () =>
      parsePaginated(
        taskSchema,
        (
          await apiClient.get("/tasks", {
            params: { parentId, pageSize: CHILDREN_PAGE_SIZE },
          })
        ).data,
      ),
    enabled: Boolean(slug),
  });
}

/** Work items that can hold a child of `childType` (see the API's hierarchy rules). */
export function useParentOptions(childType: TaskType, search: string) {
  const slug = useActiveWorkspaceSlug() ?? "";
  const wantsCampaign = childType !== "subtask";
  return useQuery({
    queryKey: [...queryKeys.tasks(slug), "parents", childType, search],
    queryFn: async () => {
      const page = parsePaginated(
        taskSchema,
        (
          await apiClient.get("/tasks", {
            params: {
              type: wantsCampaign ? "campaign" : undefined,
              search: search || undefined,
              pageSize: PARENT_OPTIONS_PAGE_SIZE,
            },
          })
        ).data,
      );
      return page.data.filter((task) =>
        wantsCampaign
          ? task.type === "campaign"
          : task.type !== "campaign" && task.type !== "subtask",
      );
    },
    enabled: Boolean(slug) && childType !== "campaign",
    placeholderData: keepPreviousData,
  });
}
