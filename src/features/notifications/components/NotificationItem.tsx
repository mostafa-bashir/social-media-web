"use client";

import { RobotOutlined } from "@ant-design/icons";
import { useFormatter, useNow } from "next-intl";

import MemberAvatar from "@/components/ui/MemberAvatar";
import { useRouter } from "@/i18n/navigation";

import type { AppNotification } from "../api/notifications";
import { useNotificationView } from "../hooks/use-notification-view";

const NOW_REFRESH_MS = 60_000;

/** One inbox line; opening it marks it read and goes to the task or post. */
export default function NotificationItem({
  notification,
  onOpen,
}: {
  notification: AppNotification;
  onOpen: (notification: AppNotification) => void;
}) {
  const router = useRouter();
  const format = useFormatter();
  // Re-renders each minute so "2 minutes ago" stays true while the bell is open.
  const now = useNow({ updateInterval: NOW_REFRESH_MS });
  const view = useNotificationView()(notification);
  const unread = notification.readAt === null;

  return (
    <li>
      <button
        type="button"
        className={`flex w-full gap-3 rounded-lg p-2 text-start hover:bg-background-subtle ${
          unread ? "bg-primary-subtle" : ""
        }`}
        onClick={() => {
          onOpen(notification);
          router.push(view.href);
        }}
      >
        {notification.actor ? (
          <MemberAvatar
            name={notification.actor.name}
            avatarUrl={notification.actor.avatarUrl}
            showTooltip={false}
          />
        ) : (
          <span
            aria-hidden
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary-text"
          >
            <RobotOutlined />
          </span>
        )}
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span
            className={`text-sm ${unread ? "font-medium text-text-primary" : "text-text-secondary"}`}
          >
            {view.text}
          </span>
          {view.detail ? (
            <span className="truncate text-xs text-text-tertiary">
              {view.detail}
            </span>
          ) : null}
          <time
            dateTime={notification.createdAt}
            className="text-xs text-text-tertiary"
          >
            {format.relativeTime(new Date(notification.createdAt), now)}
          </time>
        </span>
        {unread ? (
          <span
            aria-hidden
            className="mt-2 size-2 shrink-0 rounded-full bg-primary"
          />
        ) : null}
      </button>
    </li>
  );
}
