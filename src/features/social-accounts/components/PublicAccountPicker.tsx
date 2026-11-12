"use client";

import { Alert, Avatar, Button, Checkbox, Skeleton } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import PlatformBadge from "@/components/ui/PlatformBadge";
import StatusBadge from "@/components/ui/StatusBadge";
import { useErrorMessage } from "@/hooks/use-error-message";
import { PRIMARY_PILL_BUTTON_CLASS } from "@/lib/listing-ui";

import {
  type PublicSelection,
  useConfirmLinkSelection,
  useLinkSelection,
} from "../api/public-connect";

export type ConnectResult = Array<{
  platform: PublicSelection["platform"];
  displayName: string;
}>;

/** Pick which Pages, profiles or channels to hand to the agency. */
export default function PublicAccountPicker({
  selectionKey,
  onDone,
}: {
  selectionKey: string;
  onDone: (connected: ConnectResult) => void;
}) {
  const t = useTranslations("accounts.publicConnect");
  const tSelection = useTranslations("accounts.selection");
  const errorMessage = useErrorMessage();
  const selection = useLinkSelection(selectionKey);
  const confirm = useConfirmLinkSelection(selectionKey);
  const [chosen, setChosen] = useState<string[] | null>(null);

  if (selection.error) {
    return (
      <Alert type="error" showIcon title={errorMessage(selection.error)} />
    );
  }
  if (!selection.data) {
    return <Skeleton active avatar paragraph={{ rows: 3 }} />;
  }

  const { platform, client, accounts } = selection.data;
  const selectable = accounts.filter((account) => !account.unavailable);
  const selected = chosen ?? selectable.map((account) => account.externalId);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-semibold text-text-primary">
          {tSelection("title")}
        </h1>
        <PlatformBadge platform={platform} />
      </div>
      <p className="text-sm text-text-secondary">
        {t("pickFor", { client: client.name })}
      </p>
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
            disabled={account.unavailable}
            className="items-center! rounded-lg border border-border-default p-3"
          >
            <span className="flex flex-wrap items-center gap-3">
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
                  {tSelection("alreadyConnected")}
                </StatusBadge>
              ) : null}
              {account.unavailable ? (
                <StatusBadge>{t("unavailable")}</StatusBadge>
              ) : null}
            </span>
          </Checkbox>
        ))}
      </Checkbox.Group>
      <Button
        type="primary"
        className={PRIMARY_PILL_BUTTON_CLASS}
        disabled={selected.length === 0}
        loading={confirm.isPending}
        onClick={() =>
          confirm.mutate(selected, {
            onSuccess: ({ connected }) => onDone(connected),
          })
        }
      >
        {tSelection("confirm", { count: selected.length })}
      </Button>
    </div>
  );
}
