"use client";

import { Alert, App, Avatar, Button, Checkbox, Skeleton } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import PlatformBadge from "@/components/ui/PlatformBadge";
import StatusBadge from "@/components/ui/StatusBadge";
import { routes } from "@/config/routes";
import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { useErrorMessage } from "@/hooks/use-error-message";
import { Link, useRouter } from "@/i18n/navigation";
import { PRIMARY_PILL_BUTTON_CLASS } from "@/lib/listing-ui";

import { useConnectSelection } from "../api/get-social-accounts";
import { useConfirmSelection } from "../api/social-account-mutations";

/** Step 3 of connecting: pick which Pages/profiles/channels to add. */
export default function ConnectSelectionPage({
  selectionKey,
}: {
  selectionKey: string;
}) {
  const t = useTranslations("accounts.selection");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const router = useRouter();
  const slug = useActiveWorkspaceSlug() ?? "";
  const selection = useConnectSelection(selectionKey);
  const confirm = useConfirmSelection(selectionKey);
  const [chosen, setChosen] = useState<string[] | null>(null);
  const accountsPath = routes.workspace(slug).accounts;

  if (selection.isLoading) {
    return (
      <div className="surface-card">
        <div className="surface-panel">
          <Skeleton active avatar paragraph={{ rows: 3 }} />
        </div>
      </div>
    );
  }
  if (!selection.data) {
    return (
      <Alert
        type="error"
        showIcon
        title={errorMessage(selection.error)}
        action={<Link href={accountsPath}>{t("backToAccounts")}</Link>}
      />
    );
  }

  const { platform, client, accounts } = selection.data;
  const selectable = accounts.filter(
    (account) => !account.connectedToOtherClient,
  );
  // Default: everything that can be picked is picked.
  const selected = chosen ?? selectable.map((account) => account.externalId);

  return (
    <section className="surface-card">
      <div className="surface-panel flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <PlatformBadge platform={platform} />
          <span className="text-sm text-text-secondary">
            {t("forClient", { name: client.name })}
          </span>
        </div>
        {confirm.error ? (
          <Alert type="error" showIcon title={errorMessage(confirm.error)} />
        ) : null}
        <Checkbox.Group
          className="flex! flex-col gap-2"
          value={selected}
          onChange={(values) => setChosen(values)}
        >
          {accounts.map((account) => (
            <Checkbox
              key={account.externalId}
              value={account.externalId}
              disabled={account.connectedToOtherClient}
              className="items-center! rounded-lg border border-border-default p-3"
            >
              <span className="flex items-center gap-3">
                <Avatar
                  src={account.avatarUrl ?? undefined}
                  className="bg-primary!"
                >
                  {account.displayName.charAt(0).toUpperCase()}
                </Avatar>
                <span className="flex flex-col">
                  <span className="font-medium text-text-primary">
                    {account.displayName}
                  </span>
                  {account.username ? (
                    <span className="text-xs text-text-tertiary" dir="ltr">
                      {account.username}
                    </span>
                  ) : null}
                </span>
                {account.alreadyConnected ? (
                  <StatusBadge tone="brand">
                    {t("alreadyConnected")}
                  </StatusBadge>
                ) : null}
                {account.connectedToOtherClient ? (
                  <StatusBadge>{t("otherClient")}</StatusBadge>
                ) : null}
              </span>
            </Checkbox>
          ))}
        </Checkbox.Group>
        <div className="flex flex-wrap justify-end gap-3">
          <Button
            className="h-11! rounded-full! px-6!"
            onClick={() => router.push(accountsPath)}
          >
            {t("cancel")}
          </Button>
          <Button
            type="primary"
            className={PRIMARY_PILL_BUTTON_CLASS}
            disabled={selected.length === 0}
            loading={confirm.isPending}
            onClick={() =>
              confirm.mutate(selected, {
                onSuccess: (connected) => {
                  message.success(t("connected", { count: connected.length }));
                  router.replace(accountsPath);
                },
              })
            }
          >
            {t("confirm", { count: selected.length })}
          </Button>
        </div>
      </div>
    </section>
  );
}
