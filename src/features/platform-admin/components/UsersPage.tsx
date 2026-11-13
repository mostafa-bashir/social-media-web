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

import { useAdminUsers } from "../api/users";
import {
  type AdminUserRow,
  USER_STATE_FILTERS,
  type UserStateFilter,
} from "../types/users";
import UserStateTags from "./UserStateTags";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

/** Every agency account on the platform. */
export default function UsersPage() {
  const t = useTranslations("admin.users");
  const format = useFormatter();
  const errorMessage = useErrorMessage();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [state, setState] = useState<UserStateFilter | undefined>();
  const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);
  const users = useAdminUsers({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch,
    state,
  });

  const columns: ColumnsType<AdminUserRow> = [
    {
      title: t("columns.user"),
      key: "user",
      render: (_, user) => (
        <Link href={routes.admin.user(user.id)} className="block min-w-0">
          <div className="font-medium text-text-primary">{user.name}</div>
          <div className="truncate text-sm text-text-secondary" dir="ltr">
            {user.email}
          </div>
        </Link>
      ),
    },
    {
      title: t("columns.state"),
      key: "state",
      render: (_, user) => <UserStateTags user={user} />,
    },
    {
      title: t("columns.workspaces"),
      dataIndex: "workspaceCount",
      width: 120,
      responsive: ["sm"],
    },
    {
      title: t("columns.lastLogin"),
      dataIndex: "lastLoginAt",
      responsive: ["md"],
      render: (value: string | null) =>
        value ? format.relativeTime(new Date(value)) : "—",
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
                  placeholder={t("allStates")}
                  aria-label={t("filterState")}
                  value={state}
                  options={USER_STATE_FILTERS.map((value) => ({
                    value,
                    label: t(`state.${value}`),
                  }))}
                  onChange={(value?: UserStateFilter) => {
                    setState(value);
                    setPage(1);
                  }}
                />
              </>
            }
          />
        }
      >
        {users.error ? (
          <Alert
            type="error"
            showIcon
            title={errorMessage(users.error)}
            className="m-4!"
          />
        ) : (
          <ListingTable<AdminUserRow>
            rowKey="id"
            columns={columns}
            dataSource={users.data?.data ?? []}
            loading={users.isFetching}
            filtered={Boolean(debouncedSearch || state)}
            emptyTitle={t("empty")}
            emptyFilteredTitle={t("emptyFiltered")}
            pagination={{
              current: page,
              pageSize: PAGE_SIZE,
              total: users.data?.meta.total ?? 0,
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
