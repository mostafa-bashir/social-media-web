"use client";

import { CalendarOutlined } from "@ant-design/icons";
import { useFormatter, useNow, useTranslations } from "next-intl";

import type { Task } from "../types";

/** Due date in the viewer's zone; overdue open tasks are flagged in danger. */
export default function TaskDueLabel({
  task,
  withTime = false,
}: {
  task: Pick<Task, "dueAt" | "completedAt">;
  withTime?: boolean;
}) {
  const t = useTranslations("tasks");
  const format = useFormatter();
  const now = useNow();
  if (!task.dueAt) return null;

  const due = new Date(task.dueAt);
  const overdue = !task.completedAt && due < now;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs ${
        overdue ? "font-medium text-danger-text" : "text-text-secondary"
      }`}
    >
      <CalendarOutlined aria-hidden />
      {format.dateTime(due, {
        dateStyle: "medium",
        ...(withTime ? { timeStyle: "short" } : {}),
      })}
      {overdue ? <span>· {t("overdue")}</span> : null}
    </span>
  );
}
