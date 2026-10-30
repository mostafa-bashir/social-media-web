"use client";

import { App } from "antd";
import { useTranslations } from "next-intl";

import StatusBadge from "@/components/ui/StatusBadge";
import { useErrorMessage } from "@/hooks/use-error-message";

import { useUpdateTask } from "../api/task-mutations";
import type { Task, TaskStatus } from "../types";
import SprintSelect from "./SprintSelect";
import TaskKeyLabel from "./TaskKeyLabel";

/** One backlog line: open it, see its column and points, or move it to a sprint. */
export default function BacklogTaskRow({
  task,
  status,
  canManage,
  onOpen,
}: {
  task: Task;
  status: TaskStatus | undefined;
  canManage: boolean;
  onOpen: (task: Task) => void;
}) {
  const t = useTranslations("tasks.sprints");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const update = useUpdateTask();

  return (
    <li className="flex flex-wrap items-center gap-3 py-2">
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-2 text-start hover:text-primary-text"
        onClick={() => onOpen(task)}
      >
        <TaskKeyLabel type={task.type} taskKey={task.key} />
        <span className="truncate text-sm">{task.title}</span>
      </button>
      {status ? (
        <StatusBadge tone={status.tone}>{status.name}</StatusBadge>
      ) : null}
      <span
        className="w-10 text-center text-xs text-text-tertiary"
        title={t("points")}
      >
        {task.storyPoints ?? "–"}
      </span>
      {canManage ? (
        <SprintSelect
          className="w-40!"
          placeholder={t("backlog")}
          aria-label={t("moveTask", { key: task.key })}
          value={task.sprint?.id ?? null}
          onChange={(sprintId) =>
            update.mutate(
              { id: task.id, sprintId },
              { onError: (error) => message.error(errorMessage(error)) },
            )
          }
        />
      ) : null}
    </li>
  );
}
