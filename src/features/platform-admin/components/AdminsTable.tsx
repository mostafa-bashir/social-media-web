"use client";

import { Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useFormatter, useTranslations } from "next-intl";

import ListingTable from "@/components/ui/ListingTable";
import RowActions, { type RowAction } from "@/components/ui/RowActions";

import type { Admin } from "../types";

export interface AdminsTableProps {
  admins: Admin[];
  loading: boolean;
  currentAdminId: string;
  canManage: boolean;
  /** Builds the row's actions; empty for the signed-in admin. */
  actionsFor: (admin: Admin) => RowAction[];
}

export default function AdminsTable({
  admins,
  loading,
  currentAdminId,
  canManage,
  actionsFor,
}: AdminsTableProps) {
  const t = useTranslations("admin.admins");
  const tRoles = useTranslations("admin.roles");
  const format = useFormatter();

  const columns: ColumnsType<Admin> = [
    {
      title: t("columns.name"),
      key: "name",
      render: (_, admin) => (
        <div className="min-w-0">
          <div className="font-medium text-text-primary">
            {admin.name}
            {admin.id === currentAdminId ? (
              <span className="ms-2 text-xs text-text-tertiary">
                {t("you")}
              </span>
            ) : null}
          </div>
          <div className="truncate text-sm text-text-secondary" dir="ltr">
            {admin.email}
          </div>
        </div>
      ),
    },
    {
      title: t("columns.role"),
      dataIndex: "role",
      render: (role: Admin["role"]) => (
        <Tag color={role === "super_admin" ? "gold" : "blue"}>
          {tRoles(role)}
        </Tag>
      ),
    },
    {
      title: t("columns.status"),
      key: "status",
      render: (_, admin) =>
        !admin.isActive ? (
          <Tag>{t("status.inactive")}</Tag>
        ) : admin.pendingSetup ? (
          <Tag color="orange">{t("status.invited")}</Tag>
        ) : (
          <Tag color="green">{t("status.active")}</Tag>
        ),
    },
    {
      title: t("columns.lastLogin"),
      dataIndex: "lastLoginAt",
      responsive: ["md"],
      render: (value: string | null) =>
        value ? format.relativeTime(new Date(value)) : "—",
    },
    ...(canManage
      ? [
          {
            key: "actions",
            width: 56,
            render: (_: unknown, admin: Admin) => (
              <RowActions
                actions={actionsFor(admin)}
                label={t("actionsFor", { name: admin.name })}
              />
            ),
          },
        ]
      : []),
  ];

  return (
    <ListingTable<Admin>
      rowKey="id"
      columns={columns}
      dataSource={admins}
      loading={loading}
      pagination={false}
      emptyTitle={t("empty")}
    />
  );
}
