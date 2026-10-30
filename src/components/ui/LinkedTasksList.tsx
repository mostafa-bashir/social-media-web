"use client";

import { CheckCircleFilled } from "@ant-design/icons";
import { Skeleton } from "antd";
import { useTranslations } from "next-intl";

import StatusBadge from "@/components/ui/StatusBadge";
import { routes } from "@/config/routes";
import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { usePostTasks } from "@/hooks/use-post-tasks";
import { Link } from "@/i18n/navigation";

/** Tasks that produce or track a post, each opening on the task board. */
export default function LinkedTasksList({ postId }: { postId: string }) {
  const t = useTranslations("common.linkedTasks");
  const tStage = useTranslations("tasks.stages");
  const slug = useActiveWorkspaceSlug() ?? "";
  const tasks = usePostTasks(postId);

  if (tasks.isLoading) return <Skeleton active paragraph={{ rows: 1 }} />;
  if (!tasks.data?.length) {
    return <p className="text-sm text-text-tertiary">{t("empty")}</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {tasks.data.map((task) => (
        <li key={task.id} className="flex items-center gap-2">
          {task.completedAt ? (
            <CheckCircleFilled
              className="text-growth-text"
              aria-label={t("done")}
            />
          ) : null}
          <Link
            href={{
              pathname: routes.workspace(slug).tasks,
              query: { task: task.id },
            }}
            className="min-w-0 flex-1 truncate text-sm text-text-primary hover:text-primary-text"
          >
            <span dir="ltr" className="text-text-tertiary">
              {task.key}
            </span>{" "}
            {task.title}
          </Link>
          {task.workflowStage ? (
            <StatusBadge>{tStage(task.workflowStage)}</StatusBadge>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
