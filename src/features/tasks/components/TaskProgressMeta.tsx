import {
  ApartmentOutlined,
  CheckSquareOutlined,
  MessageOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import type { Task } from "../types";

function Meta({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-xs text-text-tertiary"
      aria-label={label}
      title={label}
    >
      {children}
    </span>
  );
}

/** Compact counters for a card: children, checklist, comments, story points. */
export default function TaskProgressMeta({ task }: { task: Task }) {
  const t = useTranslations("tasks");
  const { children, checklist } = task;
  return (
    <div className="flex flex-wrap items-center gap-3">
      {task.blockedBy > 0 ? (
        <span
          className="inline-flex items-center gap-1 text-xs text-danger-text"
          aria-label={t("links.blockedBy", { count: task.blockedBy })}
          title={t("links.blockedBy", { count: task.blockedBy })}
        >
          <StopOutlined aria-hidden />
          {task.blockedBy}
        </span>
      ) : null}
      {children.total > 0 ? (
        <Meta label={t("meta.children", children)}>
          <ApartmentOutlined aria-hidden />
          {children.done}/{children.total}
        </Meta>
      ) : null}
      {checklist.total > 0 ? (
        <Meta label={t("meta.checklist", checklist)}>
          <CheckSquareOutlined aria-hidden />
          {checklist.done}/{checklist.total}
        </Meta>
      ) : null}
      {task.commentCount > 0 ? (
        <Meta label={t("commentCount", { count: task.commentCount })}>
          <MessageOutlined aria-hidden />
          {task.commentCount}
        </Meta>
      ) : null}
      {task.storyPoints !== null ? (
        <Meta label={t("meta.points", { points: task.storyPoints })}>
          <span className="rounded-full bg-background-tertiary px-1.5 font-medium text-text-secondary">
            {task.storyPoints}
          </span>
        </Meta>
      ) : null}
    </div>
  );
}
