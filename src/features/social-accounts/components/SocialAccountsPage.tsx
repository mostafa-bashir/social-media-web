"use client";

import { LinkOutlined, SendOutlined } from "@ant-design/icons";
import { Alert, App, Button, Select } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import ClientSelect from "@/components/ui/ClientSelect";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import ListingShell from "@/components/ui/ListingShell";
import ListingToolbar from "@/components/ui/ListingToolbar";
import { Feature } from "@/config/features";
import { Permission } from "@/config/permissions";
import { useErrorMessage } from "@/hooks/use-error-message";
import { usePermissions } from "@/hooks/use-permissions";
import { TOOLBAR_CREATE_BUTTON_CLASS } from "@/lib/listing-ui";

import { useSocialAccounts } from "../api/get-social-accounts";
import {
  useDisconnectAccount,
  useStartConnect,
} from "../api/social-account-mutations";
import {
  ACCOUNT_STATUSES,
  type AccountStatus,
  SOCIAL_PLATFORMS,
  type SocialAccount,
  type SocialPlatform,
} from "../types";
import ConnectAccountModal from "./ConnectAccountModal";
import ConnectErrorAlert from "./ConnectErrorAlert";
import ConnectLinksModal from "./ConnectLinksModal";
import SocialAccountsTable from "./SocialAccountsTable";

const PAGE_SIZE = 20;

export interface SocialAccountsPageProps {
  /** From `?clientId=` (e.g. the clients list links here filtered). */
  initialClientId?: string;
  /** From `?status=` (e.g. the dashboard's reconnect tile). */
  initialStatus?: string;
  /** From `?connectError=`, set by the connect callback page. */
  connectError?: string;
  /** From `?connectLink=1` (the clients list's "Send connect link"). */
  openConnectLink?: boolean;
}

export default function SocialAccountsPage({
  initialClientId,
  initialStatus,
  connectError,
  openConnectLink = false,
}: SocialAccountsPageProps) {
  const t = useTranslations("accounts");
  const tPlatforms = useTranslations("common.platforms");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const { can, featureEnabled } = usePermissions();
  const canManage = can(Permission.AccountsManage);
  const canSendLinks = canManage && featureEnabled(Feature.ClientConnectLinks);
  const [page, setPage] = useState(1);
  const [clientId, setClientId] = useState(initialClientId);
  const [platform, setPlatform] = useState<SocialPlatform>();
  const [status, setStatus] = useState<AccountStatus | undefined>(() =>
    ACCOUNT_STATUSES.find((value) => value === initialStatus),
  );
  const [connectOpen, setConnectOpen] = useState(false);
  const [linksOpen, setLinksOpen] = useState(openConnectLink);
  const [disconnecting, setDisconnecting] = useState<SocialAccount | null>(
    null,
  );
  const accounts = useSocialAccounts({
    page,
    pageSize: PAGE_SIZE,
    clientId,
    platform,
    status,
  });
  const disconnect = useDisconnectAccount();
  const reconnect = useStartConnect();

  const toolbar = (
    <ListingToolbar
      filters={
        <>
          <ClientSelect
            allowClear
            className="w-full sm:w-56"
            placeholder={t("filters.allClients")}
            aria-label={t("filters.client")}
            value={clientId}
            onChange={(value) => {
              setClientId(value);
              setPage(1);
            }}
          />
          {/* showSearch also sidesteps an antd SSR style mismatch on read-only selects. */}
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            className="w-full sm:w-44"
            placeholder={t("filters.allPlatforms")}
            aria-label={t("filters.platform")}
            value={platform}
            options={SOCIAL_PLATFORMS.map((value) => ({
              value,
              label: tPlatforms(value),
            }))}
            onChange={(value?: SocialPlatform) => {
              setPlatform(value);
              setPage(1);
            }}
          />
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            className="w-full sm:w-44"
            placeholder={t("filters.allStatuses")}
            aria-label={t("filters.status")}
            value={status}
            options={ACCOUNT_STATUSES.map((value) => ({
              value,
              label: t(`status.${value}`),
            }))}
            onChange={(value?: AccountStatus) => {
              setStatus(value);
              setPage(1);
            }}
          />
        </>
      }
      actions={
        canManage ? (
          <>
            {canSendLinks ? (
              <Button
                icon={<SendOutlined />}
                className="rounded-full!"
                onClick={() => setLinksOpen(true)}
                aria-label={t("connectLink.button")}
              >
                <span className="max-sm:hidden">{t("connectLink.button")}</span>
              </Button>
            ) : null}
            <Button
              type="primary"
              icon={<LinkOutlined />}
              className={TOOLBAR_CREATE_BUTTON_CLASS}
              onClick={() => setConnectOpen(true)}
              aria-label={t("connectButton")}
            >
              <span className="max-sm:hidden">{t("connectButton")}</span>
            </Button>
          </>
        ) : null
      }
    />
  );

  return (
    <>
      <ConnectErrorAlert code={connectError} />
      {reconnect.error ? (
        <Alert
          type="error"
          showIcon
          title={errorMessage(reconnect.error)}
          className="mb-4!"
        />
      ) : null}
      <ListingShell toolbar={toolbar}>
        {accounts.error ? (
          <Alert
            type="error"
            showIcon
            title={errorMessage(accounts.error)}
            className="m-4!"
          />
        ) : (
          <SocialAccountsTable
            accounts={accounts.data?.data ?? []}
            total={accounts.data?.meta.total ?? 0}
            page={page}
            pageSize={PAGE_SIZE}
            loading={accounts.isFetching || reconnect.isPending}
            filtered={Boolean(clientId || platform || status)}
            canManage={canManage}
            onPageChange={setPage}
            onReconnect={(account) =>
              reconnect.mutate({
                platform: account.platform,
                clientId: account.client.id,
              })
            }
            onDisconnect={setDisconnecting}
          />
        )}
      </ListingShell>
      <ConnectAccountModal
        open={connectOpen}
        defaultClientId={clientId}
        onClose={() => setConnectOpen(false)}
      />
      {/* Mounted per opening: a shown-once link must not reappear later. */}
      {linksOpen && canSendLinks ? (
        <ConnectLinksModal
          open
          defaultClientId={clientId}
          onClose={() => setLinksOpen(false)}
        />
      ) : null}
      <DeleteConfirmModal
        open={disconnecting !== null}
        title={t("disconnectTitle")}
        question={t("disconnectQuestion", {
          name: disconnecting?.displayName ?? "",
        })}
        warning={t("disconnectWarning")}
        confirmLabel={t("disconnect")}
        loading={disconnect.isPending}
        onCancel={() => setDisconnecting(null)}
        onConfirm={() =>
          disconnecting &&
          disconnect.mutate(disconnecting.id, {
            onSuccess: () => {
              message.success(
                t("disconnected", { name: disconnecting.displayName }),
              );
              setDisconnecting(null);
            },
            onError: (error) => message.error(errorMessage(error)),
          })
        }
      />
    </>
  );
}
