"use client";

import { CloseOutlined, MailOutlined } from "@ant-design/icons";
import { App } from "antd";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import { useState } from "react";

import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import RowActions from "@/components/ui/RowActions";
import StatusBadge from "@/components/ui/StatusBadge";
import { useErrorMessage } from "@/hooks/use-error-message";
import { useRoleLabel } from "@/hooks/use-role-label";

import { usePendingInvitations, useRoleOptions } from "../api/get-members";
import { useRevokeInvitation } from "../api/member-mutations";
import type { Invitation } from "../types";

export default function PendingInvitations({
  canManage,
}: {
  canManage: boolean;
}) {
  const t = useTranslations("members.pending");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const invitations = usePendingInvitations(true);
  const roles = useRoleOptions();
  const revoke = useRevokeInvitation();
  const roleLabel = useRoleLabel();
  const [revoking, setRevoking] = useState<Invitation | null>(null);

  if (!invitations.data?.length) {
    return null;
  }

  return (
    <section className="surface-card mt-6">
      <div className="flex items-center gap-2 px-3 pb-2 pt-1">
        <h2 className="text-sm font-semibold text-text-secondary">
          {t("title")}
        </h2>
        <StatusBadge tone="accent">{invitations.data.length}</StatusBadge>
      </div>
      <ul className="surface-panel-flush divide-y divide-border-secondary">
        {invitations.data.map((invitation) => {
          const role = roles.data?.find(
            (item) => item.id === invitation.roleId,
          );
          return (
            <li
              key={invitation.id}
              className="flex flex-wrap items-center gap-3 px-5 py-3"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-accent-subtle text-accent-text">
                <MailOutlined aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div
                  className="truncate font-medium text-text-primary"
                  dir="ltr"
                >
                  {invitation.email}
                </div>
                <div className="text-xs text-text-tertiary">
                  {t("expires", {
                    date: dayjs(invitation.expiresAt).format("YYYY-MM-DD"),
                  })}
                </div>
              </div>
              {role ? <StatusBadge>{roleLabel(role)}</StatusBadge> : null}
              {canManage ? (
                <RowActions
                  label={t("actionsFor", { email: invitation.email })}
                  actions={[
                    {
                      key: "revoke",
                      label: t("revoke"),
                      icon: <CloseOutlined />,
                      danger: true,
                      onClick: () => setRevoking(invitation),
                    },
                  ]}
                />
              ) : null}
            </li>
          );
        })}
      </ul>
      <DeleteConfirmModal
        open={revoking !== null}
        title={t("revokeTitle")}
        question={t("revokeQuestion", { email: revoking?.email ?? "" })}
        confirmLabel={t("revoke")}
        loading={revoke.isPending}
        onCancel={() => setRevoking(null)}
        onConfirm={() =>
          revoking &&
          revoke.mutate(revoking.id, {
            onSuccess: () => setRevoking(null),
            onError: (error) => message.error(errorMessage(error)),
          })
        }
      />
    </section>
  );
}
