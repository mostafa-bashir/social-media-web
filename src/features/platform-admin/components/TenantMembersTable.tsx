"use client";

import { Alert, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useFormatter, useTranslations } from "next-intl";

import ListingTable from "@/components/ui/ListingTable";
import { routes } from "@/config/routes";
import { useErrorMessage } from "@/hooks/use-error-message";
import { Link } from "@/i18n/navigation";

import { useTenantMembers } from "../api/tenants";
import type { AdminTenantMember } from "../types/tenants";

export default function TenantMembersTable({ tenantId }: { tenantId: string }) {
  const t = useTranslations("admin.tenants.members");
  const format = useFormatter();
  const errorMessage = useErrorMessage();
  const members = useTenantMembers(tenantId);

  const columns: ColumnsType<AdminTenantMember> = [
    {
      title: t("name"),
      key: "name",
      render: (_, member) => (
        <Link href={routes.admin.user(member.userId)} className="block">
          <div className="font-medium text-text-primary">
            {member.name}
            {member.isOwner ? (
              <Tag color="gold" className="ms-2!">
                {t("owner")}
              </Tag>
            ) : null}
            {member.disabled ? (
              <Tag className="ms-2!">{t("disabled")}</Tag>
            ) : null}
          </div>
          <div className="text-sm text-text-secondary" dir="ltr">
            {member.email}
          </div>
        </Link>
      ),
    },
    { title: t("role"), dataIndex: "roleName", responsive: ["sm"] },
    {
      title: t("lastLogin"),
      dataIndex: "lastLoginAt",
      responsive: ["md"],
      render: (value: string | null) =>
        value ? format.relativeTime(new Date(value)) : "—",
    },
  ];

  if (members.error) {
    return <Alert type="error" showIcon title={errorMessage(members.error)} />;
  }
  return (
    <ListingTable<AdminTenantMember>
      rowKey="userId"
      columns={columns}
      dataSource={members.data ?? []}
      loading={members.isFetching}
      pagination={false}
      emptyTitle={t("empty")}
    />
  );
}
