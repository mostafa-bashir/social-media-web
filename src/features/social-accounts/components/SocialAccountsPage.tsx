"use client";

import { LinkOutlined } from "@ant-design/icons";
import { Alert, App, Button, Select } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import ListingShell from "@/components/ui/ListingShell";
import ListingToolbar from "@/components/ui/ListingToolbar";
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
  SOCIAL_PLATFORMS,
  type SocialAccount,
  type SocialPlatform,
} from "../types";
import ClientSelect from "./ClientSelect";
import ConnectAccountModal from "./ConnectAccountModal";
import ConnectErrorAlert from "./ConnectErrorAlert";
import SocialAccountsTable from "./SocialAccountsTable";

const PAGE_SIZE = 20;

export interface SocialAccountsPageProps {
  /** From `?clientId=` (e.g. the clients list links here filtered). */
  initialClientId?: string;
  /** From `?connectError=`, set by the connect callback page. */
  connectError?: string;
}

export default function SocialAccountsPage({
  initialClientId,
  connectError,
}: SocialAccountsPageProps) {
  const t = useTranslations("accounts");
  const tPlatforms = useTranslations("accounts.platforms");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const { can } = usePermissions();
  const canManage = can(Permission.AccountsManage);
  const [page, setPage] = useState(1);
  const [clientId, setClientId] = useState(initialClientId);
  const [platform, setPlatform] = useState<SocialPlatform>();
  const [connectOpen, setConnectOpen] = useState(false);
  const [disconnecting, setDisconnecting] = useState<SocialAccount | null>(
    null,
  );
  const accounts = useSocialAccounts({
    page,
    pageSize: PAGE_SIZE,
    clientId,
    platform,
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
        </>
      }
      actions={
        canManage ? (
          <Button
            type="primary"
            icon={<LinkOutlined />}
            className={TOOLBAR_CREATE_BUTTON_CLASS}
            onClick={() => setConnectOpen(true)}
            aria-label={t("connectButton")}
          >
            <span className="max-sm:hidden">{t("connectButton")}</span>
          </Button>
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
            filtered={Boolean(clientId || platform)}
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
