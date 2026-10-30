"use client";

import { MessageOutlined } from "@ant-design/icons";
import { Avatar } from "antd";
import { useTranslations } from "next-intl";

import MemberAvatar from "@/components/ui/MemberAvatar";

import type { Task } from "../types";
import TaskDueLabel from "./TaskDueLabel";
import TaskPriorityBadge from "./TaskPriorityBadge";

const MAX_AVATARS = 3;

/** What a board card shows; dragging is added by `SortableTaskCard`. */
export default function TaskCard({ task }: { task: Task }) {
  const t = useTranslations("tasks");
  return (
    <>
      <p className="line-clamp-3 text-sm font-medium text-text-primary">
        {task.title}
      </p>
      {task.client ? (
        <p className="truncate text-xs text-text-tertiary">
          {task.client.name}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <TaskPriorityBadge priority={task.priority} />
        <TaskDueLabel task={task} />
      </div>
      <div className="flex items-center justify-between gap-2">
        <Avatar.Group max={{ count: MAX_AVATARS }} size={24}>
          {task.assignees.map((person) => (
            <MemberAvatar
              key={person.userId}
              name={person.name}
              avatarUrl={person.avatarUrl}
            />
          ))}
        </Avatar.Group>
        {task.commentCount > 0 ? (
          <span
            className="inline-flex items-center gap-1 text-xs text-text-tertiary"
            aria-label={t("commentCount", { count: task.commentCount })}
          >
            <MessageOutlined aria-hidden />
            {task.commentCount}
          </span>
        ) : null}
      </div>
    </>
  );
}
