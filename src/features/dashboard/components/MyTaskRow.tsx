"use client";

import { useFormatter, useNow, useTranslations } from "next-intl";

import StatusBadge, { type StatusTone } from "@/components/ui/StatusBadge";
import { Link } from "@/i18n/navigation";

import type { MyTask } from "../api/get-my-tasks";

const PRIORITY_TONES: Record<MyTask["priority"], StatusTone> = {
  low: "neutral",
  medium: "brand",
  high: "accent",
  urgent: "danger",
};

export interface MyTaskRowProps {
  task: MyTask;
  overdue: boolean;
  href: { pathname: string; query: Record<string, string> };
}

export default function MyTaskRow({ task, overdue, href }: MyTaskRowProps) {
  const t = useTranslations("tasks.priority");
  const format = useFormatter();
  const now = useNow();
  return (
    <li>
      <Link
        href={href}
        className="flex items-start gap-3 rounded-lg px-2 py-2 hover:bg-background-tertiary focus-visible:outline-2 focus-visible:outline-primary"
      >
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="truncate text-sm text-text-primary">
            <span className="me-2 font-mono text-xs text-text-tertiary">
              {task.key}
            </span>
            {task.title}
          </span>
          <span className="flex flex-wrap items-center gap-2 text-xs">
            {task.dueAt ? (
              <span
                className={overdue ? "text-danger-text" : "text-text-tertiary"}
              >
                {format.relativeTime(new Date(task.dueAt), now)}
              </span>
            ) : null}
            {task.client ? (
              <span className="truncate text-text-tertiary">
                {task.client.name}
              </span>
            ) : null}
          </span>
        </span>
        <StatusBadge tone={PRIORITY_TONES[task.priority]}>
          {t(task.priority)}
        </StatusBadge>
      </Link>
    </li>
  );
}
