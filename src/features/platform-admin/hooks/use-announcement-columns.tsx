"use client";

import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useFormatter, useTranslations } from "next-intl";

import RowActions from "@/components/ui/RowActions";

import type { AdminAnnouncement } from "../types/announcements";

const STATE_COLORS: Record<AdminAnnouncement["state"], string> = {
  scheduled: "blue",
  live: "green",
  ended: "default",
};

/** Columns of the announcements table; row actions only when `canEdit`. */
export function useAnnouncementColumns({
  canEdit,
  onEdit,
  onDelete,
}: {
  canEdit: boolean;
  onEdit: (row: AdminAnnouncement) => void;
  onDelete: (row: AdminAnnouncement) => void;
}): ColumnsType<AdminAnnouncement> {
  const t = useTranslations("admin.announcements");
  const format = useFormatter();
  const when = (value: string | null) =>
    value
      ? format.dateTime(new Date(value), {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : t("noEnd");

  return [
    {
      title: t("columns.announcement"),
      key: "title",
      render: (_, row) => (
        <div className="min-w-0">
          <div className="font-medium text-text-primary">{row.title}</div>
          <div className="line-clamp-2 text-sm text-text-secondary">
            {row.body}
          </div>
        </div>
      ),
    },
    {
      title: t("columns.audience"),
      key: "audience",
      responsive: ["md"],
      render: (_, row) =>
        row.tenantIds
          ? t("audienceCount", { count: row.tenantIds.length })
          : t("audienceAll"),
    },
    {
      title: t("columns.window"),
      key: "window",
      responsive: ["lg"],
      render: (_, row) => `${when(row.startsAt)} → ${when(row.endsAt)}`,
    },
    {
      title: t("columns.state"),
      dataIndex: "state",
      width: 120,
      render: (state: AdminAnnouncement["state"]) => (
        <Tag color={STATE_COLORS[state]}>{t(`states.${state}`)}</Tag>
      ),
    },
    ...(canEdit
      ? [
          {
            key: "actions",
            width: 56,
            render: (_: unknown, row: AdminAnnouncement) => (
              <RowActions
                label={t("actionsFor", { title: row.title })}
                actions={[
                  {
                    key: "edit",
                    icon: <EditOutlined />,
                    label: t("edit"),
                    onClick: () => onEdit(row),
                  },
                  {
                    key: "delete",
                    icon: <DeleteOutlined />,
                    label: t("delete"),
                    danger: true,
                    onClick: () => onDelete(row),
                  },
                ]}
              />
            ),
          },
        ]
      : []),
  ];
}
