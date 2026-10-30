"use client";

import { BellOutlined } from "@ant-design/icons";
import { App, Badge, Button, Popover, Skeleton, Switch } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { useErrorMessage } from "@/hooks/use-error-message";

import {
  type AppNotification,
  useInbox,
  useMarkAllRead,
  useMarkRead,
  useNotificationSettings,
  useUnreadCount,
  useUpdateNotificationSettings,
} from "../api/notifications";
import NotificationItem from "./NotificationItem";

const PANEL_WIDTH = 380;

/** Header bell: unread badge, the latest notifications, and the email switch. */
export default function NotificationBell() {
  const t = useTranslations("notifications");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const [open, setOpen] = useState(false);
  const count = useUnreadCount().data ?? 0;
  const inbox = useInbox(open);
  const settings = useNotificationSettings(open);
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  const updateSettings = useUpdateNotificationSettings();
  const onError = (error: unknown) => message.error(errorMessage(error));
  const items = inbox.data?.data ?? [];

  const openItem = (notification: AppNotification) => {
    setOpen(false);
    if (!notification.readAt) markRead.mutate(notification.id, { onError });
  };

  const panel = (
    <div
      className="flex flex-col gap-2"
      style={{ width: PANEL_WIDTH, maxWidth: "calc(100vw - 32px)" }}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-text-primary">
          {t("title")}
        </h2>
        {count > 0 ? (
          <Button
            type="link"
            size="small"
            loading={markAll.isPending}
            onClick={() => markAll.mutate(undefined, { onError })}
          >
            {t("markAllRead")}
          </Button>
        ) : null}
      </div>
      {inbox.isLoading ? (
        <Skeleton active avatar paragraph={{ rows: 3 }} />
      ) : items.length === 0 ? (
        <p className="py-6 text-center text-sm text-text-tertiary">
          {t("empty")}
        </p>
      ) : (
        <ul className="flex max-h-[60vh] flex-col gap-1 overflow-y-auto">
          {items.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onOpen={openItem}
            />
          ))}
        </ul>
      )}
      <label className="flex items-center justify-between gap-3 border-t border-border-secondary pt-2 text-sm text-text-secondary">
        <span>{t("emailToggle")}</span>
        <Switch
          size="small"
          checked={settings.data?.emailNotifications ?? true}
          loading={settings.isLoading || updateSettings.isPending}
          onChange={(checked) => updateSettings.mutate(checked, { onError })}
        />
      </label>
    </div>
  );

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger="click"
      placement="bottomRight"
      content={panel}
      arrow={false}
    >
      <Badge count={count} size="small" overflowCount={99}>
        <Button
          type="text"
          shape="circle"
          icon={<BellOutlined />}
          className="text-inherit!"
          aria-label={count > 0 ? t("bellUnread", { count }) : t("bell")}
        />
      </Badge>
    </Popover>
  );
}
