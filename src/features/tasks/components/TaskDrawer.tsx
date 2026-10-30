"use client";

import { Button, Drawer, Skeleton } from "antd";
import { useTranslations } from "next-intl";

import { useErrorMessage } from "@/hooks/use-error-message";

import { useTask } from "../api/get-tasks";
import type { Task, TaskStatus } from "../types";
import TaskDetailMain from "./TaskDetailMain";
import TaskDetailSidebar from "./TaskDetailSidebar";
import TaskKeyLabel from "./TaskKeyLabel";
import WatchButton from "./WatchButton";

/** Wide enough for the two-column layout; full width on phones. */
const DRAWER_SIZE = "min(960px, 100vw)";

export interface TaskDrawerProps {
  taskId: string | undefined;
  statuses: TaskStatus[];
  userId: string | undefined;
  canManage: boolean;
  onClose: () => void;
  /** Opens a related task (parent or child) in the drawer. */
  onOpen: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  /** Moves the task to the top of another column. */
  onStatusChange: (task: Task, statusId: string) => Promise<unknown>;
}

/** Jira-style detail: work on the left, fields on the right (stacked on small screens). */
export default function TaskDrawer({
  taskId,
  statuses,
  userId,
  canManage,
  onClose,
  onOpen,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskDrawerProps) {
  const t = useTranslations("tasks");
  const errorMessage = useErrorMessage();
  const task = useTask(taskId);
  const data = task.data;

  const title = data ? (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2 text-xs font-normal">
        {data.parent ? (
          <>
            <button
              type="button"
              className="text-text-tertiary hover:text-primary-text"
              onClick={() => onOpen(data.parent!.id)}
            >
              <TaskKeyLabel type={data.parent.type} taskKey={data.parent.key} />
            </button>
            <span aria-hidden className="text-text-tertiary">
              /
            </span>
          </>
        ) : null}
        <TaskKeyLabel type={data.type} taskKey={data.key} />
      </div>
      <span>{data.title}</span>
    </div>
  ) : (
    t("detail.title")
  );

  return (
    <Drawer
      open={taskId !== undefined}
      onClose={onClose}
      title={title}
      size={DRAWER_SIZE}
      destroyOnHidden
      extra={
        data ? (
          <div className="flex flex-wrap justify-end gap-2">
            <WatchButton taskId={data.id} userId={userId} />
            {canManage ? (
              <>
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
              </>
            ) : null}
          </div>
        ) : null
      }
    >
      {task.error ? (
        <p className="text-sm text-danger-text">{errorMessage(task.error)}</p>
      ) : !data ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0 lg:order-1 max-lg:order-2">
            <TaskDetailMain
              task={data}
              statuses={statuses}
              userId={userId}
              canManage={canManage}
              onOpen={onOpen}
            />
          </div>
          <div className="lg:order-2 max-lg:order-1">
            <TaskDetailSidebar
              task={data}
              statuses={statuses}
              canManage={canManage}
              onStatusChange={onStatusChange}
            />
          </div>
        </div>
      )}
    </Drawer>
  );
}
