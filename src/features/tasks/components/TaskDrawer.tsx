"use client";

import { App, Button, Drawer, Select, Skeleton } from "antd";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import MemberAvatar from "@/components/ui/MemberAvatar";
import { useErrorMessage } from "@/hooks/use-error-message";

import { useTask } from "../api/get-tasks";
import type { Task, TaskStatus } from "../types";
import TaskComments from "./TaskComments";
import TaskDueLabel from "./TaskDueLabel";
import TaskPriorityBadge from "./TaskPriorityBadge";

const DRAWER_WIDTH = 520;

export interface TaskDrawerProps {
  taskId: string | undefined;
  statuses: TaskStatus[];
  userId: string | undefined;
  canManage: boolean;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  /** Moves the task to the top of another column. */
  onStatusChange: (task: Task, statusId: string) => Promise<unknown>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs text-text-tertiary">{label}</dt>
      <dd className="text-sm text-text-primary">{children}</dd>
    </div>
  );
}

export default function TaskDrawer({
  taskId,
  statuses,
  userId,
  canManage,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskDrawerProps) {
  const t = useTranslations("tasks");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const task = useTask(taskId);
  const data = task.data;

  return (
    <Drawer
      open={taskId !== undefined}
      onClose={onClose}
      title={data?.title ?? t("detail.title")}
      size={DRAWER_WIDTH}
      destroyOnHidden
    >
      {task.error ? (
        <p className="text-sm text-danger-text">{errorMessage(task.error)}</p>
      ) : !data ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <div className="flex flex-col gap-6">
          <dl className="grid grid-cols-2 gap-4">
            <Field label={t("form.status")}>
              <Select
                className="w-full"
                aria-label={t("form.status")}
                disabled={!canManage}
                value={data.statusId}
                options={statuses.map((s) => ({ value: s.id, label: s.name }))}
                onChange={(statusId) =>
                  onStatusChange(data, statusId).catch((error: unknown) =>
                    message.error(errorMessage(error)),
                  )
                }
              />
            </Field>
            <Field label={t("form.priority")}>
              <TaskPriorityBadge priority={data.priority} />
            </Field>
            <Field label={t("form.dueAt")}>
              {data.dueAt ? <TaskDueLabel task={data} withTime /> : "—"}
            </Field>
            <Field label={t("form.client")}>{data.client?.name ?? "—"}</Field>
          </dl>
          <Field label={t("form.assignees")}>
            {data.assignees.length === 0 ? (
              t("form.unassigned")
            ) : (
              <ul className="mt-1 flex flex-wrap gap-3">
                {data.assignees.map((person) => (
                  <li key={person.userId} className="flex items-center gap-2">
                    <MemberAvatar
                      name={person.name}
                      avatarUrl={person.avatarUrl}
                      showTooltip={false}
                    />
                    {person.name}
                  </li>
                ))}
              </ul>
            )}
          </Field>
          {data.description ? (
            <p className="whitespace-pre-wrap break-words text-sm text-text-primary">
              {data.description}
            </p>
          ) : null}
          {canManage ? (
            <div className="flex flex-wrap gap-2">
              <Button className="rounded-full!" onClick={() => onEdit(data)}>
                {t("edit")}
              </Button>
              <Button
                danger
                className="rounded-full!"
                onClick={() => onDelete(data)}
              >
                {t("delete")}
              </Button>
            </div>
          ) : null}
          <TaskComments
            taskId={data.id}
            userId={userId}
            canModerate={canManage}
          />
        </div>
      )}
    </Drawer>
  );
}
