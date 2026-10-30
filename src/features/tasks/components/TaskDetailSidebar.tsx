"use client";

import { Alert, App, Select } from "antd";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import MemberAvatar from "@/components/ui/MemberAvatar";
import { useErrorMessage } from "@/hooks/use-error-message";
import { dayjs } from "@/lib/dayjs";

import type { Task, TaskStatus } from "../types";
import TaskDueLabel from "./TaskDueLabel";
import TaskLabelTags from "./TaskLabelTags";
import TaskPriorityBadge from "./TaskPriorityBadge";
import TaskTimeField from "./TaskTimeField";
import TaskTypeIcon from "./TaskTypeIcon";

const DATE_FORMAT = "D MMM YYYY, HH:mm";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs text-text-tertiary">{label}</dt>
      <dd className="text-sm text-text-primary">{children}</dd>
    </div>
  );
}

export interface TaskDetailSidebarProps {
  task: Task;
  statuses: TaskStatus[];
  canManage: boolean;
  onStatusChange: (task: Task, statusId: string) => Promise<unknown>;
}

/** The "details" column of the task view: status and every planning field. */
export default function TaskDetailSidebar({
  task,
  statuses,
  canManage,
  onStatusChange,
}: TaskDetailSidebarProps) {
  const t = useTranslations("tasks");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();

  return (
    <dl className="surface-panel flex flex-col gap-4 p-4">
      {task.blockedBy > 0 ? (
        <Alert
          type="warning"
          showIcon
          title={t("links.blockedBy", { count: task.blockedBy })}
        />
      ) : null}
      <Field label={t("form.status")}>
        <Select
          className="w-full"
          aria-label={t("form.status")}
          disabled={!canManage}
          value={task.statusId}
          options={statuses.map((s) => ({ value: s.id, label: s.name }))}
          onChange={(statusId) =>
            onStatusChange(task, statusId).catch((error: unknown) =>
              message.error(errorMessage(error)),
            )
          }
        />
      </Field>
      <Field label={t("form.type")}>
        <span className="inline-flex items-center gap-2">
          <TaskTypeIcon type={task.type} />
          {t(`types.${task.type}`)}
        </span>
      </Field>
      <Field label={t("form.priority")}>
        <TaskPriorityBadge priority={task.priority} />
      </Field>
      <Field label={t("form.assignees")}>
        {task.assignees.length === 0 ? (
          t("form.unassigned")
        ) : (
          <ul className="mt-1 flex flex-col gap-2">
            {task.assignees.map((person) => (
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
      <Field label={t("form.labels")}>
        {task.labels.length === 0 ? (
          "—"
        ) : (
          <TaskLabelTags labels={task.labels} />
        )}
      </Field>
      <Field label={t("form.sprint")}>
        {task.sprint?.name ?? t("sprints.backlog")}
      </Field>
      <Field label={t("form.storyPoints")}>{task.storyPoints ?? "—"}</Field>
      <Field label={t("time.title")}>
        <TaskTimeField task={task} />
      </Field>
      <Field label={t("form.startAt")}>
        {task.startAt ? dayjs(task.startAt).format(DATE_FORMAT) : "—"}
      </Field>
      <Field label={t("form.dueAt")}>
        {task.dueAt ? <TaskDueLabel task={task} withTime /> : "—"}
      </Field>
      <Field label={t("form.client")}>{task.client?.name ?? "—"}</Field>
    </dl>
  );
}
