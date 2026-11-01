"use client";

import { useTranslations } from "next-intl";

import { Permission } from "@/config/permissions";
import { routes } from "@/config/routes";
import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { usePermissions } from "@/hooks/use-permissions";

import { MY_TASKS_LIMIT, useMyTasks } from "../api/get-my-tasks";
import { useDashboardClient, withClient } from "../hooks/use-dashboard-client";
import DashboardCard from "./DashboardCard";
import MyTaskRow from "./MyTaskRow";

/** The caller's overdue tasks first, then what's due this week. */
export default function MyTasksCard() {
  const t = useTranslations("dashboard.myTasks");
  const slug = useActiveWorkspaceSlug() ?? "";
  const { can } = usePermissions();
  const { clientId } = useDashboardClient();
  const allowed = can(Permission.TasksView);
  const overdue = useMyTasks("overdue", allowed, clientId);
  const week = useMyTasks("week", allowed, clientId);

  if (!allowed) return null;
  const rows = [
    ...(overdue.data?.data ?? []).map((task) => ({ task, overdue: true })),
    ...(week.data?.data ?? []).map((task) => ({ task, overdue: false })),
  ].slice(0, MY_TASKS_LIMIT);
  const tasksPath = routes.workspace(slug).tasks;

  return (
    <DashboardCard
      title={t("title")}
      href={withClient(`${tasksPath}?view=list&assigneeId=me`, clientId)}
      loading={overdue.isLoading || week.isLoading}
      error={overdue.isError || week.isError}
    >
      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-secondary">
          {t("empty")}
        </p>
      ) : (
        <ul className="flex flex-col">
          {rows.map(({ task, overdue: isOverdue }) => (
            <MyTaskRow
              key={task.id}
              task={task}
              overdue={isOverdue}
              href={{ pathname: tasksPath, query: { task: task.id } }}
            />
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}
