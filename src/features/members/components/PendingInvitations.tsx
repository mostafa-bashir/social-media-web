"use client";

import { App, Button, Popconfirm, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";

import { useRoleLabel, useRoles } from "@/features/roles";
import { useErrorMessage } from "@/hooks/use-error-message";

import { useInvitations, useRevokeInvitation } from "../api/members-api";

export function PendingInvitations({ canManage }: { canManage: boolean }) {
  const t = useTranslations("members.pending");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const invitations = useInvitations(true);
  const revoke = useRevokeInvitation();
  const roles = useRoles();
  const roleLabel = useRoleLabel();

  if (!invitations.data?.length) {
    return null;
  }

  return (
    <section className="mt-8">
      <Typography.Title level={5}>{t("title")}</Typography.Title>
      <ul className="divide-y divide-app-border rounded-lg border border-app-border bg-app-surface">
        {invitations.data.map((invitation) => {
          const role = roles.data?.find(
            (item) => item.id === invitation.roleId,
          );
          return (
            <li
              key={invitation.id}
              className="flex flex-wrap items-center gap-3 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium" dir="ltr">
                  {invitation.email}
                </div>
                <div className="text-xs text-app-muted">
                  {t("expires", {
                    date: dayjs(invitation.expiresAt).format("YYYY-MM-DD"),
                  })}
                </div>
              </div>
              {role ? <Tag>{roleLabel(role)}</Tag> : null}
              {canManage ? (
                <Popconfirm
                  title={t("revokeConfirm", { email: invitation.email })}
                  okButtonProps={{ danger: true }}
                  onConfirm={() =>
                    revoke.mutateAsync(invitation.id).catch((error) => {
                      message.error(errorMessage(error));
                    })
                  }
                >
                  <Button type="link" danger>
                    {t("revoke")}
                  </Button>
                </Popconfirm>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
