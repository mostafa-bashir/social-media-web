"use client";

import {
  CheckCircleOutlined,
  MailOutlined,
  StopOutlined,
  SwapOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { Alert, App, Button } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import ListingShell from "@/components/ui/ListingShell";
import ListingToolbar from "@/components/ui/ListingToolbar";
import PageHeader from "@/components/ui/PageHeader";
import type { RowAction } from "@/components/ui/RowActions";
import { useErrorMessage } from "@/hooks/use-error-message";
import { TOOLBAR_CREATE_BUTTON_CLASS } from "@/lib/listing-ui";

import { useAdminSessionQuery } from "../api/admin-session";
import { useAdmins, useResendAdminInvite, useUpdateAdmin } from "../api/admins";
import type { Admin } from "../types";
import AdminsTable from "./AdminsTable";
import InviteAdminModal from "./InviteAdminModal";

export default function AdminsPage() {
  const t = useTranslations("admin.admins");
  const errorMessage = useErrorMessage();
  const { message, modal } = App.useApp();
  const current = useAdminSessionQuery().data?.admin;
  const admins = useAdmins();
  const updateAdmin = useUpdateAdmin();
  const resendInvite = useResendAdminInvite();
  const [inviteOpen, setInviteOpen] = useState(false);
  const canManage = current?.role === "super_admin";

  const notify = {
    onError: (error: unknown) => message.error(errorMessage(error)),
  };

  const actionsFor = (admin: Admin): RowAction[] => {
    if (admin.id === current?.id) {
      return [];
    }
    const otherRole = admin.role === "super_admin" ? "support" : "super_admin";
    const actions: RowAction[] = [
      {
        key: "role",
        icon: <SwapOutlined />,
        label: t(`actions.makeRole.${otherRole}`),
        onClick: () =>
          updateAdmin.mutate(
            { id: admin.id, role: otherRole },
            { ...notify, onSuccess: () => message.success(t("updated")) },
          ),
      },
    ];
    if (admin.isActive && admin.pendingSetup) {
      actions.push({
        key: "resend",
        icon: <MailOutlined />,
        label: t("actions.resend"),
        onClick: () =>
          resendInvite.mutate(admin.id, {
            ...notify,
            onSuccess: () =>
              message.success(t("resent", { email: admin.email })),
          }),
      });
    }
    actions.push(
      admin.isActive
        ? {
            key: "deactivate",
            icon: <StopOutlined />,
            label: t("actions.deactivate"),
            danger: true,
            onClick: () =>
              modal.confirm({
                title: t("deactivateTitle", { name: admin.name }),
                content: t("deactivateWarning"),
                okText: t("actions.deactivate"),
                okButtonProps: { danger: true },
                onOk: () =>
                  updateAdmin
                    .mutateAsync({ id: admin.id, isActive: false })
                    .catch((error: unknown) =>
                      message.error(errorMessage(error)),
                    ),
              }),
          }
        : {
            key: "reactivate",
            icon: <CheckCircleOutlined />,
            label: t("actions.reactivate"),
            onClick: () =>
              updateAdmin.mutate({ id: admin.id, isActive: true }, notify),
          },
    );
    return actions;
  };

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <ListingShell
        fillPage={false}
        toolbar={
          <ListingToolbar
            actions={
              canManage ? (
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  className={TOOLBAR_CREATE_BUTTON_CLASS}
                  onClick={() => setInviteOpen(true)}
                  aria-label={t("inviteButton")}
                >
                  <span className="max-sm:hidden">{t("inviteButton")}</span>
                </Button>
              ) : null
            }
          />
        }
      >
        {admins.error ? (
          <Alert
            type="error"
            showIcon
            title={errorMessage(admins.error)}
            className="m-4!"
          />
        ) : (
          <AdminsTable
            admins={admins.data ?? []}
            loading={admins.isFetching}
            currentAdminId={current?.id ?? ""}
            canManage={canManage}
            actionsFor={actionsFor}
          />
        )}
      </ListingShell>
      <InviteAdminModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />
    </>
  );
}
