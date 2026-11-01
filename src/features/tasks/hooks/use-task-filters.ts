"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";

import {
  DUE_FILTERS,
  TASK_PRIORITIES,
  TASK_TYPES,
  TASK_VIEWS,
  type TaskFilters,
  type TaskView,
} from "../types";

const DEFAULT_VIEW: TaskView = "board";

export interface TaskPageState extends TaskFilters {
  view: TaskView;
  /** Task open in the drawer, so a task can be linked. */
  task?: string;
  /** `create=1` opens the new-task form (link from the dashboard). */
  create?: "1";
}

const pick = <T extends string>(list: readonly T[], value: string | null) =>
  list.find((item) => item === value);

/** View, filters and the open task, kept in the URL so the page can be shared. */
export function useTaskFilters() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const state = useMemo<TaskPageState>(
    () => ({
      view: pick(TASK_VIEWS, params.get("view")) ?? DEFAULT_VIEW,
      type: pick(TASK_TYPES, params.get("type")),
      sprintId: params.get("sprintId") ?? undefined,
      labelId: params.get("labelId") ?? undefined,
      clientId: params.get("clientId") ?? undefined,
      assigneeId: params.get("assigneeId") ?? undefined,
      priority: pick(TASK_PRIORITIES, params.get("priority")),
      due: pick(DUE_FILTERS, params.get("due")),
      search: params.get("search") ?? undefined,
      task: params.get("task") ?? undefined,
      create: params.get("create") === "1" ? "1" : undefined,
    }),
    [params],
  );

  const filters = useMemo<TaskFilters>(
    () => ({
      sprintId: state.sprintId,
      type: state.type,
      labelId: state.labelId,
      clientId: state.clientId,
      assigneeId: state.assigneeId,
      priority: state.priority,
      due: state.due,
      search: state.search,
    }),
    [state],
  );

  const update = useCallback(
    (change: Partial<TaskPageState>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(change)) {
        if (value && !(key === "view" && value === DEFAULT_VIEW)) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
      }
      router.replace(
        { pathname, query: Object.fromEntries(next) },
        { scroll: false },
      );
    },
    [params, pathname, router],
  );

  return { state, filters, update };
}
