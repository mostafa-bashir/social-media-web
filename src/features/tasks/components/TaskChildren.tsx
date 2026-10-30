"use client";

import { App, Input, Progress } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import StatusBadge from "@/components/ui/StatusBadge";
import { useErrorMessage } from "@/hooks/use-error-message";

import { useTaskChildren } from "../api/get-tasks";
import { useCreateTask } from "../api/task-mutations";
import type { Task, TaskStatus } from "../types";
import TaskKeyLabel from "./TaskKeyLabel";

const MAX_TITLE_LENGTH = 200;

export interface TaskChildrenProps {
  task: Task;
  statuses: TaskStatus[];
  canManage: boolean;
  onOpen: (taskId: string) => void;
}

/** Subtasks of a task, or the items of a campaign, with quick add. */
export default function TaskChildren({
  task,
  statuses,
  canManage,
  onOpen,
}: TaskChildrenProps) {
  const t = useTranslations("tasks.children");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const children = useTaskChildren(task.id);
  const create = useCreateTask();
  const [title, setTitle] = useState("");
  const statusById = new Map(statuses.map((status) => [status.id, status]));
  const isCampaign = task.type === "campaign";
  const { total, done } = task.children;

  const add = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    create.mutate(
      {
        title: trimmed,
        type: isCampaign ? "task" : "subtask",
        parentId: task.id,
      },
      {
        onSuccess: () => setTitle(""),
        onError: (error) => message.error(errorMessage(error)),
      },
    );
  };

  return (
    <section className="flex flex-col gap-3" aria-labelledby="task-children">
      <div className="flex items-center justify-between gap-3">
        <h3
          id="task-children"
          className="text-sm font-semibold text-text-primary"
        >
          {isCampaign ? t("campaignTitle") : t("subtasksTitle")}
        </h3>
        {total > 0 ? (
          <span className="text-xs text-text-tertiary">
            {t("progress", { done, total })}
          </span>
        ) : null}
      </div>
      {total > 0 ? (
        <Progress
          percent={Math.round((done / total) * 100)}
          showInfo={false}
          size="small"
          aria-label={t("progress", { done, total })}
        />
      ) : null}
      <ul className="flex flex-col divide-y divide-border-secondary">
        {(children.data?.data ?? []).map((child) => {
          const status = statusById.get(child.statusId);
          return (
            <li key={child.id}>
              <button
                type="button"
                className="flex w-full items-center gap-3 py-2 text-start hover:bg-background-secondary"
                onClick={() => onOpen(child.id)}
              >
                <TaskKeyLabel type={child.type} taskKey={child.key} />
                <span className="min-w-0 flex-1 truncate text-sm text-text-primary">
                  {child.title}
                </span>
                {status ? (
                  <StatusBadge tone={status.tone}>{status.name}</StatusBadge>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
      {canManage ? (
        <Input
          value={title}
          maxLength={MAX_TITLE_LENGTH}
          disabled={create.isPending}
          placeholder={isCampaign ? t("addItem") : t("addSubtask")}
          aria-label={isCampaign ? t("addItem") : t("addSubtask")}
          onChange={(event) => setTitle(event.target.value)}
          onPressEnter={add}
        />
      ) : null}
    </section>
  );
}
