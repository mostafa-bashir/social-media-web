"use client";

import {
  LoadingOutlined,
  PlusOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Alert, Avatar, Button, Empty, Skeleton, Tag, Typography } from "antd";
import { useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { routes } from "@/config/routes";
import { useErrorMessage } from "@/hooks/use-error-message";
import { useSwitchWorkspace } from "@/hooks/use-switch-workspace";
import { Link } from "@/i18n/navigation";

import { useMe } from "../api/get-me";

export default function WorkspacePicker() {
  const t = useTranslations("workspaces.picker");
  const errorMessage = useErrorMessage();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const me = useMe();
  const { switchTo, switchingTo } = useSwitchWorkspace();
  const [denied, setDenied] = useState(false);
  const attemptedDeepLink = useRef(false);

  // Deep link into a workspace that isn't active yet (set by proxy.ts).
  const requestedSlug = searchParams.get("switchTo");
  useEffect(() => {
    if (!requestedSlug || attemptedDeepLink.current) return;
    attemptedDeepLink.current = true;
    void switchTo(requestedSlug, searchParams.get("next") ?? undefined).then(
      (switched) => setDenied(!switched),
    );
  }, [requestedSlug, searchParams, switchTo]);

  if (me.isLoading || (requestedSlug && !denied)) {
    return <Skeleton active paragraph={{ rows: 4 }} />;
  }
  if (me.error) {
    return <Alert type="error" showIcon title={errorMessage(me.error)} />;
  }

  const workspaces = me.data?.workspaces ?? [];

  return (
    <>
      <Typography.Title level={3} className="mb-1!">
        {t("title", { name: me.data?.user.name ?? "" })}
      </Typography.Title>
      <Typography.Paragraph type="secondary">
        {t("subtitle")}
      </Typography.Paragraph>
      {denied ? (
        <Alert
          type="warning"
          showIcon
          title={t("noAccess", { slug: requestedSlug ?? "" })}
          className="mb-4!"
        />
      ) : null}
      {workspaces.length === 0 ? (
        <Empty description={t("empty")} />
      ) : (
        <ul className="divide-y divide-app-border overflow-hidden rounded-lg border border-app-border">
          {workspaces.map((workspace) => (
            <li key={workspace.id}>
              <button
                type="button"
                aria-label={t("open", { name: workspace.name })}
                disabled={switchingTo !== null}
                onClick={() => void switchTo(workspace.slug)}
                className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-start transition-colors hover:bg-app-bg focus-visible:bg-app-bg focus-visible:outline-none disabled:cursor-wait"
              >
                <Avatar src={workspace.logoUrl ?? undefined}>
                  {workspace.name.charAt(0).toUpperCase()}
                </Avatar>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">
                    {workspace.name}
                  </span>
                  <span
                    className="block truncate text-xs text-app-muted"
                    dir="ltr"
                  >
                    /{workspace.slug}
                  </span>
                </span>
                {workspace.isOwner ? <Tag>{t("owner")}</Tag> : null}
                {switchingTo === workspace.slug ? (
                  <LoadingOutlined />
                ) : (
                  <RightOutlined className="rtl:rotate-180" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
      <Link href={routes.workspaces.create}>
        <Button type="primary" icon={<PlusOutlined />} block className="mt-4!">
          {t("create")}
        </Button>
      </Link>
      <div className="mt-4 text-center">
        <Button
          type="link"
          onClick={() =>
            void signOut({ callbackUrl: `/${locale}${routes.auth.login}` })
          }
        >
          {t("signOut")}
        </Button>
      </div>
    </>
  );
}
