"use client";

import { Alert, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useFormatter, useTranslations } from "next-intl";

import ListingTable from "@/components/ui/ListingTable";
import PlatformBadge from "@/components/ui/PlatformBadge";
import { useErrorMessage } from "@/hooks/use-error-message";

import { useTenantAccounts } from "../api/tenants";
import type { AdminTenantAccount } from "../types/tenants";

const ACTIVE_STATUS = "active";

/** Connections only: tokens never leave the API. */
export default function TenantAccountsTable({
  tenantId,
}: {
  tenantId: string;
}) {
  const t = useTranslations("admin.tenants.accounts");
  const format = useFormatter();
  const errorMessage = useErrorMessage();
  const accounts = useTenantAccounts(tenantId);

  const columns: ColumnsType<AdminTenantAccount> = [
    {
      title: t("account"),
      key: "account",
      render: (_, account) => (
        <div className="min-w-0">
          <div className="font-medium text-text-primary">
            {account.displayName}
          </div>
          <PlatformBadge platform={account.platform} />
        </div>
      ),
    },
    { title: t("client"), dataIndex: "clientName", responsive: ["sm"] },
    {
      title: t("status"),
      key: "status",
      render: (_, account) => {
        const tag = (
          <Tag color={account.status === ACTIVE_STATUS ? "green" : "orange"}>
            {account.status === ACTIVE_STATUS ? t("connected") : t("reconnect")}
          </Tag>
        );
        return account.lastError ? (
          <Tooltip title={account.lastError}>{tag}</Tooltip>
        ) : (
          tag
        );
      },
    },
    {
      title: t("tokenExpires"),
      dataIndex: "tokenExpiresAt",
      responsive: ["md"],
      render: (value: string | null) =>
        value ? format.relativeTime(new Date(value)) : t("noExpiry"),
    },
  ];

  if (accounts.error) {
    return <Alert type="error" showIcon title={errorMessage(accounts.error)} />;
  }
  return (
    <ListingTable<AdminTenantAccount>
      rowKey="id"
      columns={columns}
      dataSource={accounts.data ?? []}
      loading={accounts.isFetching}
      pagination={false}
      emptyTitle={t("empty")}
    />
  );
}
