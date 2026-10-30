"use client";

import { RobotOutlined } from "@ant-design/icons";
import { Skeleton } from "antd";
import { useTranslations } from "next-intl";

import MemberAvatar from "@/components/ui/MemberAvatar";
import { dayjs } from "@/lib/dayjs";

import { useTaskHistory } from "../api/collaboration";
import { useActivityText } from "../hooks/use-activity-text";
import type { TaskActivity } from "../types";

const DATE_FORMAT = "D MMM YYYY, HH:mm";

/** Who changed what and when, newest first. Automation shows as the system. */
export default function TaskHistory({ taskId }: { taskId: string }) {
  const t = useTranslations("tasks.history");
  const history = useTaskHistory(taskId);
  const describe = useActivityText();

  if (history.isLoading) return <Skeleton active paragraph={{ rows: 4 }} />;
  const entries = history.data?.data ?? [];
  if (entries.length === 0) {
    return <p className="text-sm text-text-tertiary">{t("empty")}</p>;
  }
  return (
    <ol className="flex flex-col gap-4">
      {entries.map((entry: TaskActivity) => (
        <li key={entry.id} className="flex gap-3">
          {entry.actor ? (
            <MemberAvatar
              name={entry.actor.name}
              avatarUrl={entry.actor.avatarUrl}
              showTooltip={false}
            />
          ) : (
            <span
              aria-hidden
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-xs text-primary-text"
            >
              <RobotOutlined />
            </span>
          )}
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="text-sm text-text-primary">
              <span className="font-medium">
                {entry.actor?.name ?? t("automation")}
              </span>{" "}
              {describe(entry)}
            </p>
            <time
              dateTime={entry.createdAt}
              className="text-xs text-text-tertiary"
            >
              {dayjs(entry.createdAt).format(DATE_FORMAT)}
            </time>
          </div>
        </li>
      ))}
    </ol>
  );
}
