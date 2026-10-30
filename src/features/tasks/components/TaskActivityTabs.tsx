"use client";

import { Tabs } from "antd";
import { useTranslations } from "next-intl";

import { Permission } from "@/config/permissions";
import { usePermissions } from "@/hooks/use-permissions";

import TaskComments from "./TaskComments";
import TaskHistory from "./TaskHistory";
import TaskWorklogPanel from "./TaskWorklogPanel";

/** Jira's activity area: discussion, change history and time spent. */
export default function TaskActivityTabs({
  taskId,
  userId,
  canManage,
}: {
  taskId: string;
  userId: string | undefined;
  canManage: boolean;
}) {
  const t = useTranslations("tasks.activityTabs");
  const { can } = usePermissions();

  return (
    <Tabs
      // History and time load only when their tab is opened.
      destroyOnHidden
      items={[
        {
          key: "comments",
          label: t("comments"),
          children: (
            <TaskComments
              taskId={taskId}
              userId={userId}
              canModerate={canManage}
            />
          ),
        },
        {
          key: "history",
          label: t("history"),
          children: <TaskHistory taskId={taskId} />,
        },
        {
          key: "worklog",
          label: t("worklog"),
          children: (
            <TaskWorklogPanel
              taskId={taskId}
              userId={userId}
              canManage={canManage}
              canModerate={can(Permission.TasksConfigure)}
            />
          ),
        },
      ]}
    />
  );
}
