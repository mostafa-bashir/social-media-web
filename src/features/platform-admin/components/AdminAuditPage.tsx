"use client";

import { SearchOutlined } from "@ant-design/icons";
import { Alert, Input, Select, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";

import ListingShell from "@/components/ui/ListingShell";
import ListingTable from "@/components/ui/ListingTable";
import ListingToolbar from "@/components/ui/ListingToolbar";
import PageHeader from "@/components/ui/PageHeader";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useErrorMessage } from "@/hooks/use-error-message";

import { useAdmins } from "../api/admins";
import { useAdminAuditLog } from "../api/audit-log";
import type { AdminAuditEntry } from "../types";

const PAGE_SIZE = 25;
const SEARCH_DEBOUNCE_MS = 300;

/** Every action taken in the console, newest first. */
export default function AdminAuditPage() {
  const t = useTranslations("admin.audit");
  const format = useFormatter();
  const errorMessage = useErrorMessage();
  const [page, setPage] = useState(1);
  const [adminId, setAdminId] = useState<string | undefined>();
  const [action, setAction] = useState("");
  const debouncedAction = useDebouncedValue(action.trim(), SEARCH_DEBOUNCE_MS);
  const admins = useAdmins();
  const log = useAdminAuditLog({
    page,
    pageSize: PAGE_SIZE,
    adminId,
    action: debouncedAction,
  });

  const columns: ColumnsType<AdminAuditEntry> = [
    {
      title: t("columns.when"),
      dataIndex: "createdAt",
      width: 200,
      render: (value: string) =>
        format.dateTime(new Date(value), {
          dateStyle: "medium",
          timeStyle: "short",
        }),
    },
    {
      title: t("columns.admin"),
      key: "admin",
      render: (_, entry) => entry.adminName ?? t("unknownAdmin"),
    },
    {
      title: t("columns.action"),
      dataIndex: "action",
      render: (value: string) => (
        <Tag className="font-mono" dir="ltr">
          {value}
        </Tag>
      ),
    },
    {
      title: t("columns.target"),
      key: "target",
      responsive: ["md"],
      render: (_, entry) =>
        entry.targetType ? (
          <span className="text-sm text-text-secondary" dir="ltr">
            {entry.targetType}
            {entry.targetId ? ` · ${entry.targetId.slice(0, 8)}` : ""}
          </span>
        ) : (
          "—"
        ),
    },
    {
      title: t("columns.ip"),
      dataIndex: "ipAddress",
      responsive: ["lg"],
      render: (value: string | null) => <span dir="ltr">{value ?? "—"}</span>,
    },
  ];

  const filtered = Boolean(adminId || debouncedAction);

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <ListingShell
        fillPage={false}
        toolbar={
          <ListingToolbar
            filters={
              <>
                <Select
                  allowClear
                  className="w-full sm:w-56!"
                  placeholder={t("allAdmins")}
                  aria-label={t("filterAdmin")}
                  value={adminId}
                  loading={admins.isLoading}
                  options={(admins.data ?? []).map((admin) => ({
                    value: admin.id,
                    label: admin.name,
                  }))}
                  onChange={(value?: string) => {
                    setAdminId(value);
                    setPage(1);
                  }}
                />
                <Input
                  allowClear
                  prefix={<SearchOutlined className="text-text-tertiary" />}
                  placeholder={t("actionPlaceholder")}
                  aria-label={t("actionPlaceholder")}
                  className="sm:max-w-xs!"
                  value={action}
                  onChange={(event) => {
                    setAction(event.target.value);
                    setPage(1);
                  }}
                />
              </>
            }
          />
        }
      >
        {log.error ? (
          <Alert
            type="error"
            showIcon
            title={errorMessage(log.error)}
            className="m-4!"
          />
        ) : (
          <ListingTable<AdminAuditEntry>
            rowKey="id"
            columns={columns}
            dataSource={log.data?.data ?? []}
            loading={log.isFetching}
            filtered={filtered}
            emptyTitle={t("empty")}
            emptyFilteredTitle={t("emptyFiltered")}
            pagination={{
              current: page,
              pageSize: PAGE_SIZE,
              total: log.data?.meta.total ?? 0,
              showSizeChanger: false,
              onChange: setPage,
              hideOnSinglePage: true,
            }}
          />
        )}
      </ListingShell>
    </>
  );
}
