"use client";

import { MailOutlined } from "@ant-design/icons";
import { Alert, Button, Result, Skeleton, Space } from "antd";
import { signOut, useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";

import { routes } from "@/config/routes";
import { useSwitchWorkspace } from "@/features/workspaces";
import { useErrorMessage } from "@/hooks/use-error-message";
import { Link } from "@/i18n/navigation";

import {
  useAcceptInvitation,
  useInvitationPreview,
} from "../api/invitations-api";

export function InvitationLanding({ token }: { token: string }) {
  const t = useTranslations("workspaces.invitation");
  const errorMessage = useErrorMessage();
  const locale = useLocale();
  const { data: session, status } = useSession();
  const preview = useInvitationPreview(token);
  const accept = useAcceptInvitation();
  const { switchTo } = useSwitchWorkspace();

  if (preview.isLoading || status === "loading") {
    return <Skeleton active paragraph={{ rows: 3 }} />;
  }
  if (preview.error || !preview.data) {
    return (
      <Result
        status="warning"
        title={errorMessage(preview.error ?? "INVITATION_INVALID")}
        extra={<Link href="/">{t("goHome")}</Link>}
      />
    );
  }

  const invitation = preview.data;
  const invitePath = `/${locale}${routes.invite(token)}`;
  const heading = (
    <Result
      icon={<MailOutlined />}
      title={t("title", { workspace: invitation.workspaceName })}
      subTitle={t("subtitle", {
        inviter: invitation.inviterName ?? t("someone"),
        email: invitation.email,
      })}
    />
  );

  if (!session) {
    const query = new URLSearchParams({
      email: invitation.email,
      callbackUrl: invitePath,
    }).toString();
    return (
      <>
        {heading}
        <Space orientation="vertical" className="w-full">
          <Link
            href={`${
              invitation.accountExists
                ? routes.auth.login
                : routes.auth.register
            }?${query}`}
          >
            <Button type="primary" block>
              {invitation.accountExists
                ? t("signInToAccept")
                : t("registerToAccept")}
            </Button>
          </Link>
        </Space>
      </>
    );
  }

  if (session.user.email !== invitation.email) {
    return (
      <>
        {heading}
        <Alert
          type="warning"
          showIcon
          title={t("wrongAccount", {
            current: session.user.email,
            invited: invitation.email,
          })}
          className="!mb-4"
        />
        <Button
          block
          onClick={() =>
            void signOut({
              callbackUrl: `/${locale}${routes.auth.login}?callbackUrl=${encodeURIComponent(invitePath)}`,
            })
          }
        >
          {t("switchAccount")}
        </Button>
      </>
    );
  }

  return (
    <>
      {heading}
      {accept.error ? (
        <Alert
          type="error"
          showIcon
          title={errorMessage(accept.error)}
          className="!mb-4"
        />
      ) : null}
      <Button
        type="primary"
        block
        loading={accept.isPending || accept.isSuccess}
        onClick={() =>
          accept.mutate(token, {
            onSuccess: (workspace) => void switchTo(workspace.slug),
          })
        }
      >
        {t("accept")}
      </Button>
    </>
  );
}
