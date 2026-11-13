"use client";

import { SafetyCertificateOutlined } from "@ant-design/icons";
import { Alert, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";

import ListingTable from "@/components/ui/ListingTable";
import { useErrorMessage } from "@/hooks/use-error-message";

import { useTenantActivity } from "../api/tenants";
import type { AdminTenantActivity } from "../types/tenants";

const PAGE_SIZE = 20;

/** The workspace's own audit trail; support-session actions are flagged. */
export default function TenantActivityTable({
  tenantId,
}: {
  tenantId: string;
}) {
  const t = useTranslations("admin.tenants.activity");
  const format = useFormatter();
  const errorMessage = useErrorMessage();
  const [page, setPage] = useState(1);
  const activity = useTenantActivity(tenantId, page, PAGE_SIZE);

  const columns: ColumnsType<AdminTenantActivity> = [
    {
      title: t("when"),
      dataIndex: "createdAt",
      width: 190,
      render: (value: string) =>
        format.dateTime(new Date(value), {
          dateStyle: "medium",
          timeStyle: "short",
        }),
    },
    {
      title: t("action"),
      key: "action",
      render: (_, entry) => (
        <span className="inline-flex items-center gap-2">
          <Tag className="font-mono" dir="ltr">
            {entry.action}
          </Tag>
          {entry.metadata?.impersonationId ? (
            <Tooltip title={t("bySupport")}>
              <SafetyCertificateOutlined
                className="text-accent"
                aria-label={t("bySupport")}
              />
            </Tooltip>
          ) : null}
        </span>
      ),
    },
    {
      title: t("actor"),
      dataIndex: "actorEmail",
      responsive: ["md"],
      render: (value: string | null) => (
        <span dir="ltr">{value ?? t("system")}</span>
      ),
    },
  ];

  if (activity.error) {
    return <Alert type="error" showIcon title={errorMessage(activity.error)} />;
  }
  return (
    <ListingTable<AdminTenantActivity>
      rowKey="id"
      columns={columns}
      dataSource={activity.data?.data ?? []}
      loading={activity.isFetching}
      emptyTitle={t("empty")}
      pagination={{
        current: page,
        pageSize: PAGE_SIZE,
        total: activity.data?.meta.total ?? 0,
        showSizeChanger: false,
        hideOnSinglePage: true,
        onChange: setPage,
      }}
    />
  );
}
