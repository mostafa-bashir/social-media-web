"use client";

import {
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { Skeleton } from "antd";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import RowActions, { type RowAction } from "@/components/ui/RowActions";
import StatusBadge from "@/components/ui/StatusBadge";
import { dayjs } from "@/lib/dayjs";

import { useTasks } from "../api/get-tasks";
import type { Sprint, Task, TaskStatus } from "../types";
import BacklogTaskRow from "./BacklogTaskRow";

/** A sprint holds at most this many tasks in the backlog view (more = split the sprint). */
const SECTION_PAGE_SIZE = 100;
const DATE_FORMAT = "D MMM";

export interface SprintSectionProps {
  /** Null = the backlog (tasks without a sprint). */
  sprint: Sprint | null;
  statuses: TaskStatus[];
  canManage: boolean;
  /** No other sprint is active, so this one may start. */
  canStart: boolean;
  onOpen: (task: Task) => void;
  onEdit?: () => void;
  onStart?: () => void;
  onComplete?: () => void;
  onDelete?: () => void;
  extra?: ReactNode;
}

export default function SprintSection({
  sprint,
  statuses,
  canManage,
  canStart,
  onOpen,
  onEdit,
  onStart,
  onComplete,
  onDelete,
  extra,
}: SprintSectionProps) {
  const t = useTranslations("tasks.sprints");
  const tasks = useTasks({
    sprintId: sprint?.id ?? "backlog",
    page: 1,
    pageSize: SECTION_PAGE_SIZE,
  });
  const statusById = new Map(statuses.map((status) => [status.id, status]));
  const rows = (tasks.data?.data ?? []).filter(
    // The backlog lists open, top-level work; subtasks travel with their parent.
    (task) => (sprint ? true : !task.completedAt && task.type !== "subtask"),
  );

  const actions: RowAction[] = sprint
    ? [
        ...(sprint.state === "planned" && canStart && onStart
          ? [
              {
                key: "start",
                label: t("start"),
                icon: <PlayCircleOutlined />,
                onClick: onStart,
              },
            ]
          : []),
        ...(sprint.state === "active" && onComplete
          ? [
              {
                key: "complete",
                label: t("completeAction"),
                icon: <CheckOutlined />,
                onClick: onComplete,
              },
            ]
          : []),
        ...(onEdit
          ? [
              {
                key: "edit",
                label: t("edit"),
                icon: <EditOutlined />,
                onClick: onEdit,
              },
            ]
          : []),
        ...(sprint.state === "planned" && onDelete
          ? [
              {
                key: "delete",
                label: t("delete"),
                icon: <DeleteOutlined />,
                danger: true,
                onClick: onDelete,
              },
            ]
          : []),
      ]
    : [];

  return (
    <section className="surface-panel flex flex-col gap-2 p-4">
      <header className="flex flex-wrap items-center gap-3">
        <h3 className="text-sm font-semibold text-text-primary">
          {sprint?.name ?? t("backlog")}
        </h3>
        {sprint ? (
          <StatusBadge tone={sprint.state === "active" ? "brand" : "neutral"}>
            {t(`states.${sprint.state}`)}
          </StatusBadge>
        ) : null}
        {sprint?.startAt ? (
          <span className="text-xs text-text-tertiary" dir="ltr">
            {dayjs(sprint.startAt).format(DATE_FORMAT)}
            {sprint.endAt
              ? ` – ${dayjs(sprint.endAt).format(DATE_FORMAT)}`
              : ""}
          </span>
        ) : null}
        <span className="text-xs text-text-tertiary">
          {sprint
            ? t("summary", {
                tasks: sprint.taskCount,
                done: sprint.donePoints,
                points: sprint.points,
              })
            : t("backlogSummary", { tasks: rows.length })}
        </span>
        <div className="ms-auto flex items-center gap-2">
          {extra}
          {canManage && actions.length > 0 ? (
            <RowActions
              actions={actions}
              label={t("actionsFor", { name: sprint?.name ?? "" })}
            />
          ) : null}
        </div>
      </header>
      {sprint?.goal ? (
        <p className="text-sm text-text-secondary">{sprint.goal}</p>
      ) : null}
      {tasks.isLoading ? (
        <Skeleton active paragraph={{ rows: 2 }} />
      ) : rows.length === 0 ? (
        <p className="py-2 text-sm text-text-tertiary">
          {sprint ? t("emptySprint") : t("emptyBacklog")}
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-border-secondary">
          {rows.map((task) => (
            <BacklogTaskRow
              key={task.id}
              task={task}
              status={statusById.get(task.statusId)}
              canManage={canManage}
              onOpen={onOpen}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
