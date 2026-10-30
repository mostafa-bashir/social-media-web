"use client";

import { EyeFilled, EyeOutlined } from "@ant-design/icons";
import { App, Button, Tooltip } from "antd";
import { useTranslations } from "next-intl";

import { useErrorMessage } from "@/hooks/use-error-message";

import { useToggleWatch, useWatchers } from "../api/collaboration";

/** Follow or unfollow a task; the tooltip lists who's watching. */
export default function WatchButton({
  taskId,
  userId,
}: {
  taskId: string;
  userId: string | undefined;
}) {
  const t = useTranslations("tasks.watchers");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const watchers = useWatchers(taskId).data ?? [];
  const toggle = useToggleWatch(taskId);
  const watching = watchers.some((person) => person.userId === userId);
  const names = watchers.map((person) => person.name).join(", ");

  return (
    <Tooltip title={names ? t("list", { names }) : t("none")}>
      <Button
        className="rounded-full!"
        icon={watching ? <EyeFilled /> : <EyeOutlined />}
        aria-pressed={watching}
        loading={toggle.isPending}
        onClick={() =>
          toggle.mutate(!watching, {
            onError: (error) => message.error(errorMessage(error)),
          })
        }
      >
        {watching ? t("watching", { count: watchers.length }) : t("watch")}
      </Button>
    </Tooltip>
  );
}
