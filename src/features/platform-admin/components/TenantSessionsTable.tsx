"use client";

import { Alert, App, Button, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useFormatter, useTranslations } from "next-intl";

import ListingTable from "@/components/ui/ListingTable";
import { useErrorMessage } from "@/hooks/use-error-message";

import {
  useEndImpersonation,
  useTenantImpersonations,
} from "../api/impersonations";
import type { AdminImpersonation } from "../types/tenants";

const STATE_COLORS: Record<AdminImpersonation["state"], string> = {
  pending: "blue",
  active: "orange",
  ended: "default",
  expired: "default",
};

/** Every "Open as owner" session for this workspace; live ones can be ended here. */
export default function TenantSessionsTable({
  tenantId,
}: {
  tenantId: string;
}) {
  const t = useTranslations("admin.tenants.sessions");
  const format = useFormatter();
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const sessions = useTenantImpersonations(tenantId);
  const endSession = useEndImpersonation();

  const columns: ColumnsType<AdminImpersonation> = [
    {
      title: t("started"),
      dataIndex: "createdAt",
      width: 190,
      render: (value: string) =>
        format.dateTime(new Date(value), {
          dateStyle: "medium",
          timeStyle: "short",
        }),
    },
    {
      title: t("admin"),
      dataIndex: "adminName",
      render: (value: string | null) => value ?? "—",
    },
    {
      title: t("reason"),
      dataIndex: "reason",
      responsive: ["md"],
      render: (value: string) => <span className="text-sm">{value}</span>,
    },
    {
      title: t("state"),
      key: "state",
      width: 170,
      render: (_, session) =>
        session.state === "active" || session.state === "pending" ? (
          <span className="inline-flex items-center gap-2">
            <Tag color={STATE_COLORS[session.state]}>
              {t(`states.${session.state}`)}
            </Tag>
            <Button
              size="small"
              danger
              loading={
                endSession.isPending && endSession.variables === session.id
              }
              onClick={() =>
                endSession.mutate(session.id, {
                  onSuccess: () => message.success(t("endedMessage")),
                  onError: (error) => message.error(errorMessage(error)),
                })
              }
            >
              {t("end")}
            </Button>
          </span>
        ) : (
          <Tag color={STATE_COLORS[session.state]}>
            {t(`states.${session.state}`)}
          </Tag>
        ),
    },
  ];

  if (sessions.error) {
    return <Alert type="error" showIcon title={errorMessage(sessions.error)} />;
  }
  return (
    <ListingTable<AdminImpersonation>
      rowKey="id"
      columns={columns}
      dataSource={sessions.data?.data ?? []}
      loading={sessions.isFetching}
      pagination={false}
      emptyTitle={t("empty")}
    />
  );
}
