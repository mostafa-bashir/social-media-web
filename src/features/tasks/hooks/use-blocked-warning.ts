"use client";

import { App } from "antd";
import { useTranslations } from "next-intl";

import type { Task, TaskStatus } from "../types";

/**
 * Like Jira, finishing a blocked task is allowed but flagged: warns when a
 * task with open blockers is moved into a "done" column.
 */
export function useBlockedWarning(statuses: TaskStatus[]) {
  const t = useTranslations("tasks.links");
  const { message } = App.useApp();
  return (task: Pick<Task, "blockedBy"> | undefined, statusId: string) => {
    const done = statuses.find((s) => s.id === statusId)?.category === "done";
    if (done && task && task.blockedBy > 0) {
      message.warning(t("movingBlocked", { count: task.blockedBy }));
    }
  };
}
