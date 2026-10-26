"use client";

import { Avatar, Checkbox, Skeleton } from "antd";
import { useTranslations } from "next-intl";

import { PLATFORM_ICONS } from "@/components/ui/platform-icons";
import { routes } from "@/config/routes";
import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { Link } from "@/i18n/navigation";

import type { ComposerAccount } from "../types";

export interface AccountPickerProps {
  accounts: ComposerAccount[];
  loading: boolean;
  selectedIds: string[];
  onToggle: (account: ComposerAccount, selected: boolean) => void;
}

/** Accounts of the chosen client; ones needing a reconnect can't be picked. */
export default function AccountPicker({
  accounts,
  loading,
  selectedIds,
  onToggle,
}: AccountPickerProps) {
  const t = useTranslations("posts.composer");
  const slug = useActiveWorkspaceSlug() ?? "";

  if (loading) return <Skeleton active paragraph={{ rows: 2 }} />;
  if (accounts.length === 0) {
    return (
      <p className="text-sm text-text-secondary">
        {t("noAccounts")}{" "}
        <Link
          href={routes.workspace(slug).accounts}
          className="text-primary-text hover:underline"
        >
          {t("connectAccounts")}
        </Link>
      </p>
    );
  }

  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {accounts.map((account) => {
        const disabled = account.status !== "active";
        const checked = selectedIds.includes(account.id);
        return (
          <li key={account.id}>
            <label
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${
                checked
                  ? "border-primary-border bg-primary-subtle"
                  : "border-border-default"
              } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <Checkbox
                checked={checked}
                disabled={disabled}
                onChange={(event) => onToggle(account, event.target.checked)}
              />
              <Avatar src={account.avatarUrl} size={32}>
                {account.displayName.charAt(0)}
              </Avatar>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-text-primary">
                  {account.displayName}
                </span>
                <span className="text-xs text-text-tertiary">
                  {disabled ? t("needsReconnect") : null}
                </span>
              </span>
              <span className="text-lg text-text-secondary" aria-hidden>
                {PLATFORM_ICONS[account.platform]}
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
