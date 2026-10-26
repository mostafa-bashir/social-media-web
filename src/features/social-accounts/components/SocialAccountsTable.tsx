"use client";

import {
  CheckCircleOutlined,
  DisconnectOutlined,
  ReloadOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Avatar, type TableProps, Tooltip } from "antd";
import { useTranslations } from "next-intl";

import ListingTable from "@/components/ui/ListingTable";
import PlatformBadge from "@/components/ui/PlatformBadge";
import RowActions from "@/components/ui/RowActions";
import StatusBadge from "@/components/ui/StatusBadge";

import type { SocialAccount } from "../types";

export interface SocialAccountsTableProps {
  accounts: SocialAccount[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  filtered: boolean;
  canManage: boolean;
  onPageChange: (page: number) => void;
  onReconnect: (account: SocialAccount) => void;
  onDisconnect: (account: SocialAccount) => void;
}

export default function SocialAccountsTable({
  accounts,
  total,
  page,
  pageSize,
  loading,
  filtered,
  canManage,
  onPageChange,
  onReconnect,
  onDisconnect,
}: SocialAccountsTableProps) {
  const t = useTranslations("accounts");

  const columns: TableProps<SocialAccount>["columns"] = [
    {
      title: t("columns.account"),
      key: "account",
      render: (_, account) => (
        <div className="flex min-w-0 items-center gap-3">
          <Avatar
            src={account.avatarUrl ?? undefined}
            className="shrink-0 bg-primary!"
          >
            {account.displayName.charAt(0).toUpperCase()}
          </Avatar>
          <div className="min-w-0">
            <div className="truncate font-medium text-text-primary">
              {account.displayName}
            </div>
            {account.username ? (
              <div className="truncate text-xs text-text-tertiary" dir="ltr">
                {account.username}
              </div>
            ) : null}
          </div>
        </div>
      ),
    },
    {
      title: t("columns.platform"),
      key: "platform",
      width: 160,
      responsive: ["sm"],
      render: (_, account) => <PlatformBadge platform={account.platform} />,
    },
    {
      title: t("columns.client"),
      key: "client",
      width: 200,
      responsive: ["md"],
      render: (_, account) => account.client.name,
    },
    {
      title: t("columns.status"),
      key: "status",
      render: (_, account) =>
        account.status === "active" ? (
          <div className="flex flex-col items-start gap-1">
            <Tooltip title={account.lastError ?? undefined}>
              <span>
                <StatusBadge
                  tone={account.lastError ? "accent" : "growth"}
                  icon={<CheckCircleOutlined />}
                >
                  {t("status.active")}
                </StatusBadge>
              </span>
            </Tooltip>
            {account.analyticsEnabled ? null : (
              <Tooltip title={t("analyticsOffHint")}>
                <span className="text-xs text-accent-text">
                  {t("analyticsOff")}
                </span>
              </Tooltip>
            )}
          </div>
        ) : (
          <Tooltip title={t("reconnectHint")}>
            <span>
              <StatusBadge tone="danger" icon={<WarningOutlined />}>
                {t("status.reconnect_required")}
              </StatusBadge>
            </span>
          </Tooltip>
        ),
    },
    {
      key: "actions",
      width: 64,
      align: "end",
      render: (_, account) =>
        canManage ? (
          <RowActions
            label={t("actionsFor", { name: account.displayName })}
            actions={[
              {
                key: "reconnect",
                label: t("reconnect"),
                icon: <ReloadOutlined />,
                onClick: () => onReconnect(account),
              },
              {
                key: "disconnect",
                label: t("disconnect"),
                icon: <DisconnectOutlined />,
                danger: true,
                onClick: () => onDisconnect(account),
              },
            ]}
          />
        ) : null,
    },
  ];

  return (
    <ListingTable<SocialAccount>
      rowKey="id"
      columns={columns}
      dataSource={accounts}
      loading={loading}
      filtered={filtered}
      emptyTitle={t("empty.title")}
      emptyDescription={t("empty.description")}
      emptyFilteredTitle={t("empty.filtered")}
      pagination={{
        current: page,
        pageSize,
        total,
        onChange: onPageChange,
        showSizeChanger: false,
        hideOnSinglePage: true,
      }}
    />
  );
}
