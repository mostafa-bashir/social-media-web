"use client";

import { CheckOutlined } from "@ant-design/icons";
import { Alert, Avatar, Button, Result, Skeleton } from "antd";
import { useFormatter, useTranslations } from "next-intl";

import { PLATFORM_ICONS } from "@/components/ui/platform-icons";
import { useErrorMessage } from "@/hooks/use-error-message";
import { toApiError } from "@/lib/api/api-error";

import {
  usePublicConnectLink,
  useStartLinkConnect,
} from "../api/public-connect";
import PublicConnectShell from "./PublicConnectShell";

const LOGO_SIZE = 56;
const PROMISES = ["ownLogin", "access", "remove"] as const;

/** What someone sees when they open a connect link the agency sent them. */
export default function PublicConnectPage({ token }: { token: string }) {
  const t = useTranslations("accounts.publicConnect");
  const tPlatforms = useTranslations("common.platforms");
  const format = useFormatter();
  const errorMessage = useErrorMessage();
  const link = usePublicConnectLink(token);
  const start = useStartLinkConnect(token);

  if (link.error) {
    // Only an unknown or closed link is "gone"; a busy network or a rate
    // limit is worth another try.
    const gone = toApiError(link.error).code === "CONNECT_LINK_NOT_FOUND";
    return (
      <PublicConnectShell>
        {gone ? (
          <Result status="404" title={t("gone")} subTitle={t("goneHint")} />
        ) : (
          <Result
            status="warning"
            title={t("loadFailed")}
            subTitle={errorMessage(link.error)}
            extra={
              <Button
                type="primary"
                className="rounded-full!"
                loading={link.isFetching}
                onClick={() => void link.refetch()}
              >
                {t("tryAgain")}
              </Button>
            }
          />
        )}
      </PublicConnectShell>
    );
  }
  if (!link.data) {
    return (
      <PublicConnectShell>
        <Skeleton active avatar paragraph={{ rows: 5 }} />
      </PublicConnectShell>
    );
  }

  const { workspace, client, platforms, expiresAt } = link.data;
  const available = platforms.filter((entry) => entry.configured);
  return (
    <PublicConnectShell>
      <header className="flex items-center gap-4">
        {client.logoUrl ? (
          <Avatar shape="square" size={LOGO_SIZE} src={client.logoUrl} alt="" />
        ) : null}
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-text-primary">
            {t("title", { client: client.name })}
          </h1>
          <p className="text-sm text-text-secondary">
            {t("invitedBy", { workspace: workspace.name })}
          </p>
        </div>
      </header>
      <ul className="flex flex-col gap-2 text-sm text-text-secondary">
        {PROMISES.map((key) => (
          <li key={key} className="flex gap-2">
            <CheckOutlined className="mt-1 text-growth" aria-hidden />
            <span>{t(`promises.${key}`, { workspace: workspace.name })}</span>
          </li>
        ))}
      </ul>
      {start.error ? (
        <Alert type="error" showIcon title={errorMessage(start.error)} />
      ) : null}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-text-primary">
          {t("pickPlatform")}
        </h2>
        {available.length === 0 ? (
          <Alert type="info" showIcon title={t("noPlatforms")} />
        ) : (
          available.map(({ platform }) => (
            <Button
              key={platform}
              size="large"
              icon={PLATFORM_ICONS[platform]}
              className="justify-start! rounded-full!"
              loading={start.isPending && start.variables === platform}
              disabled={start.isPending}
              onClick={() => start.mutate(platform)}
            >
              {t("connectWith", { platform: tPlatforms(platform) })}
            </Button>
          ))
        )}
      </div>
      <p className="text-xs text-text-tertiary">
        {t("expires", {
          when: format.dateTime(new Date(expiresAt), { dateStyle: "medium" }),
        })}
      </p>
    </PublicConnectShell>
  );
}
