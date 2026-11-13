"use client";

import { SearchOutlined } from "@ant-design/icons";
import { Alert, Input, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";

import ListingShell from "@/components/ui/ListingShell";
import ListingTable from "@/components/ui/ListingTable";
import ListingToolbar from "@/components/ui/ListingToolbar";
import PageHeader from "@/components/ui/PageHeader";
import { routes } from "@/config/routes";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useErrorMessage } from "@/hooks/use-error-message";
import { Link } from "@/i18n/navigation";

import { useAdminTenants } from "../api/tenants";
import {
  type AdminTenantRow,
  TENANT_STATUSES,
  type TenantStatus,
} from "../types/tenants";
import TenantStatusTag from "./TenantStatusTag";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

/** Every workspace on the platform, searchable by name, URL or owner email. */
export default function TenantsPage() {
  const t = useTranslations("admin.tenants");
  const format = useFormatter();
  const errorMessage = useErrorMessage();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TenantStatus | undefined>();
  const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);
  const tenants = useAdminTenants({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch,
    status,
  });

  const columns: ColumnsType<AdminTenantRow> = [
    {
      title: t("columns.workspace"),
      key: "workspace",
      render: (_, tenant) => (
        <Link href={routes.admin.tenant(tenant.id)} className="block min-w-0">
          <div className="font-medium text-text-primary">{tenant.name}</div>
          <div className="text-sm text-text-secondary" dir="ltr">
            /{tenant.slug}
          </div>
        </Link>
      ),
    },
    {
      title: t("columns.owner"),
      key: "owner",
      responsive: ["md"],
      render: (_, tenant) => (
        <span className="text-sm" dir="ltr">
          {tenant.ownerEmail ?? "—"}
        </span>
      ),
    },
    { title: t("columns.members"), dataIndex: "memberCount", width: 110 },
    {
      title: t("columns.status"),
      dataIndex: "status",
      width: 130,
      render: (value: TenantStatus) => <TenantStatusTag status={value} />,
    },
    {
      title: t("columns.created"),
      dataIndex: "createdAt",
      responsive: ["lg"],
      render: (value: string) =>
        format.dateTime(new Date(value), { dateStyle: "medium" }),
    },
  ];

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <ListingShell
        fillPage={false}
        toolbar={
          <ListingToolbar
            filters={
              <>
                <Input
                  allowClear
                  prefix={<SearchOutlined className="text-text-tertiary" />}
                  placeholder={t("searchPlaceholder")}
                  aria-label={t("searchPlaceholder")}
                  className="sm:max-w-xs!"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                />
                <Select
                  allowClear
                  className="w-full sm:w-44!"
                  placeholder={t("allStatuses")}
                  aria-label={t("filterStatus")}
                  value={status}
                  options={TENANT_STATUSES.map((value) => ({
                    value,
                    label: t(`status.${value}`),
                  }))}
                  onChange={(value?: TenantStatus) => {
                    setStatus(value);
                    setPage(1);
                  }}
                />
              </>
            }
          />
        }
      >
        {tenants.error ? (
          <Alert
            type="error"
            showIcon
            title={errorMessage(tenants.error)}
            className="m-4!"
          />
        ) : (
          <ListingTable<AdminTenantRow>
            rowKey="id"
            columns={columns}
            dataSource={tenants.data?.data ?? []}
            loading={tenants.isFetching}
            filtered={Boolean(debouncedSearch || status)}
            emptyTitle={t("empty")}
            emptyFilteredTitle={t("emptyFiltered")}
            pagination={{
              current: page,
              pageSize: PAGE_SIZE,
              total: tenants.data?.meta.total ?? 0,
              showSizeChanger: false,
              hideOnSinglePage: true,
              onChange: setPage,
            }}
          />
        )}
      </ListingShell>
    </>
  );
}
