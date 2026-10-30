"use client";

import { Avatar } from "antd";

import MemberAvatar from "@/components/ui/MemberAvatar";

import type { Task } from "../types";
import TaskDueLabel from "./TaskDueLabel";
import TaskKeyLabel from "./TaskKeyLabel";
import TaskLabelTags from "./TaskLabelTags";
import TaskPriorityBadge from "./TaskPriorityBadge";
import TaskProgressMeta from "./TaskProgressMeta";
import TaskSocialMeta from "./TaskSocialMeta";

const MAX_AVATARS = 3;

/** What a board card shows; dragging is added by `SortableTaskCard`. */
export default function TaskCard({ task }: { task: Task }) {
  return (
    <>
      {task.parent ? (
        <p className="truncate text-xs text-text-tertiary">
          <span dir="ltr">{task.parent.key}</span> · {task.parent.title}
        </p>
      ) : null}
      <p className="line-clamp-3 text-sm font-medium text-text-primary">
        {task.title}
      </p>
      {task.client ? (
        <p className="truncate text-xs text-text-tertiary">
          {task.client.name}
        </p>
      ) : null}
      <TaskLabelTags labels={task.labels} />
      <TaskSocialMeta task={task} />
      <div className="flex flex-wrap items-center gap-2">
        <TaskPriorityBadge priority={task.priority} />
        <TaskDueLabel task={task} />
      </div>
      <TaskProgressMeta task={task} />
      <div className="flex items-center justify-between gap-2">
        <TaskKeyLabel type={task.type} taskKey={task.key} />
        <Avatar.Group max={{ count: MAX_AVATARS }} size={24}>
          {task.assignees.map((person) => (
            <MemberAvatar
              key={person.userId}
              name={person.name}
              avatarUrl={person.avatarUrl}
            />
          ))}
        </Avatar.Group>
      </div>
    </>
  );
}
