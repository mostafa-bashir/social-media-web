"use client";

import type { TableProps } from "antd";
import { useTranslations } from "next-intl";

import ListingTable from "@/components/ui/ListingTable";
import RowActions from "@/components/ui/RowActions";
import StatusBadge from "@/components/ui/StatusBadge";
import { routes } from "@/config/routes";
import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { Link } from "@/i18n/navigation";

import {
  type ClientRowHandlers,
  useClientRowActions,
} from "../hooks/use-client-row-actions";
import type { Client } from "../types";
import ClientAvatar from "./ClientAvatar";

export interface ClientsTableProps extends ClientRowHandlers {
  clients: Client[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  filtered: boolean;
  archived: boolean;
  canManage: boolean;
  onPageChange: (page: number) => void;
}

export default function ClientsTable({
  clients,
  total,
  page,
  pageSize,
  loading,
  filtered,
  archived,
  canManage,
  onPageChange,
  ...handlers
}: ClientsTableProps) {
  const t = useTranslations("clients");
  const slug = useActiveWorkspaceSlug() ?? "";
  const actionsFor = useClientRowActions(archived, handlers);

  const columns: TableProps<Client>["columns"] = [
    {
      title: t("columns.client"),
      key: "client",
      render: (_, client) => (
        <div className="flex items-center gap-3">
          <ClientAvatar client={client} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate font-medium text-text-primary">
                {client.name}
              </span>
              {client.isProspect ? (
                <StatusBadge tone="accent">{t("prospect")}</StatusBadge>
              ) : null}
            </div>
            {client.notes ? (
              <div className="max-w-md truncate text-xs text-text-tertiary">
                {client.notes}
              </div>
            ) : null}
          </div>
        </div>
      ),
    },
    {
      title: t("columns.timezone"),
      dataIndex: "timezone",
      width: 200,
      responsive: ["md"],
      render: (timezone: string) => <span dir="ltr">{timezone}</span>,
    },
    {
      title: t("columns.accounts"),
      key: "accounts",
      width: 160,
      render: (_, client) => (
        <Link
          href={{
            pathname: routes.workspace(slug).accounts,
            query: { clientId: client.id },
          }}
          className="text-primary-text hover:underline"
        >
          {t("accountCount", { count: client.accountCount })}
        </Link>
      ),
    },
    {
      key: "actions",
      width: 64,
      align: "end",
      render: (_, client) =>
        canManage ? (
          <RowActions
            label={t("actionsFor", { name: client.name })}
            actions={actionsFor(client)}
          />
        ) : null,
    },
  ];

  return (
    <ListingTable<Client>
      rowKey="id"
      columns={columns}
      dataSource={clients}
      loading={loading}
      filtered={filtered}
      emptyTitle={archived ? t("empty.archived") : t("empty.title")}
      emptyDescription={archived ? undefined : t("empty.description")}
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
