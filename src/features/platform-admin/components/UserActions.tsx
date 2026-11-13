"use client";

import {
  CheckCircleOutlined,
  LogoutOutlined,
  MailOutlined,
  StopOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import { App, Button } from "antd";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { useErrorMessage } from "@/hooks/use-error-message";

import { useAdminSessionQuery } from "../api/admin-session";
import { useUserAction } from "../api/users";
import type { AdminUserDetail, UserAction } from "../types/users";

interface ActionButton {
  action: UserAction;
  icon: ReactNode;
  danger?: boolean;
  /** Destructive enough to ask first. */
  confirm?: boolean;
}

/** Account controls (super admins only). Admins never see or set passwords. */
export default function UserActions({ user }: { user: AdminUserDetail }) {
  const t = useTranslations("admin.users.actions");
  const errorMessage = useErrorMessage();
  const { message, modal } = App.useApp();
  const isSuperAdmin =
    useAdminSessionQuery().data?.admin.role === "super_admin";
  const run = useUserAction(user.id);
  if (!isSuperAdmin) {
    return null;
  }

  const buttons: ActionButton[] = [
    { action: "sign-out", icon: <LogoutOutlined />, confirm: true },
    ...(user.locked
      ? [{ action: "unlock" as const, icon: <UnlockOutlined /> }]
      : []),
    ...(user.verified
      ? [{ action: "password-reset" as const, icon: <MailOutlined /> }]
      : [{ action: "verify-email" as const, icon: <CheckCircleOutlined /> }]),
    user.disabled
      ? { action: "enable", icon: <CheckCircleOutlined /> }
      : {
          action: "disable",
          icon: <StopOutlined />,
          danger: true,
          confirm: true,
        },
  ];

  const execute = (action: UserAction) =>
    run
      .mutateAsync(action)
      .then(() => message.success(t(`done.${action}`, { email: user.email })))
      .catch((error: unknown) => message.error(errorMessage(error)));

  return (
    <>
      {buttons.map(({ action, icon, danger, confirm }) => (
        <Button
          key={action}
          icon={icon}
          danger={danger}
          className="rounded-full!"
          loading={run.isPending && run.variables === action}
          onClick={() =>
            confirm
              ? modal.confirm({
                  title: t(`confirm.${action}`, { name: user.name }),
                  okText: t(action),
                  okButtonProps: { danger: true },
                  onOk: () => execute(action),
                })
              : void execute(action)
          }
        >
          {t(action)}
        </Button>
      ))}
    </>
  );
}
