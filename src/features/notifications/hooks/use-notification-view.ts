"use client";

import { useTranslations } from "next-intl";

import { routes } from "@/config/routes";
import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";

import type { AppNotification } from "../api/notifications";

/** Types this app knows how to word; anything newer falls back to a generic line. */
const KNOWN_TYPES = new Set([
  "task.assigned",
  "task.mentioned",
  "task.commented",
  "task.updated",
  "task.moved",
  "task.automation_moved",
  "task.post_failed",
  "task.goal_reached",
  "task.goal_missed",
  "task.due_soon",
  "post.review_requested",
  "post.approved",
  "post.changes_requested",
  "sprint.started",
]);

/** Message text and destination for one notification. */
export function useNotificationView() {
  const t = useTranslations("notifications");
  const slug = useActiveWorkspaceSlug() ?? "";
  const workspace = routes.workspace(slug);

  return (notification: AppNotification) => {
    const { data } = notification;
    const values = {
      actor: notification.actor?.name ?? t("someone"),
      key: String(data.key ?? ""),
      title: String(data.title ?? ""),
      caption: String(data.caption ?? "") || t("noCaption"),
      column: String(data.column ?? ""),
      name: String(data.name ?? ""),
      metric: String(data.metric ?? ""),
      target: String(data.target ?? ""),
    };
    const text = KNOWN_TYPES.has(notification.type)
      ? t(`types.${notification.type.replace(".", "_")}`, values)
      : t("generic");
    const href =
      notification.resourceType === "task"
        ? {
            pathname: workspace.tasks,
            query: { task: notification.resourceId },
          }
        : notification.resourceType === "post"
          ? {
              pathname: workspace.posts,
              query: { post: notification.resourceId },
            }
          : { pathname: workspace.tasks, query: { view: "backlog" } };
    const detail =
      typeof data.excerpt === "string"
        ? data.excerpt
        : typeof data.comment === "string"
          ? data.comment
          : null;
    return { text, href, detail };
  };
}
