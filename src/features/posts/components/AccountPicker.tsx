"use client";

import { Avatar, Checkbox, Skeleton } from "antd";
import { useTranslations } from "next-intl";

import { PLATFORM_ICONS } from "@/components/ui/platform-icons";
import { routes } from "@/config/routes";
import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { Link } from "@/i18n/navigation";

import type { ComposerAccount, TargetFormat } from "../types";
import FormatPicker from "./FormatPicker";

export interface AccountPickerProps {
  accounts: ComposerAccount[];
  loading: boolean;
  /** Selected account id → its format. */
  formats: Record<string, TargetFormat>;
  mediaCount: number;
  onToggle: (account: ComposerAccount, selected: boolean) => void;
  onFormatChange: (accountId: string, format: TargetFormat) => void;
}

/** Accounts of the chosen client, each with its format; ones needing a reconnect can't be picked. */
export default function AccountPicker({
  accounts,
  loading,
  formats,
  mediaCount,
  onToggle,
  onFormatChange,
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
    <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      {accounts.map((account) => {
        const disabled = account.status !== "active";
        const format = formats[account.id];
        const checked = format !== undefined;
        return (
          <li
            key={account.id}
            className={`flex flex-col gap-2 rounded-xl border p-3 ${
              checked
                ? "border-primary-border bg-primary-subtle"
                : "border-border-default"
            } ${disabled ? "opacity-60" : ""}`}
          >
            <label
              className={`flex items-center gap-3 ${
                disabled ? "cursor-not-allowed" : "cursor-pointer"
              }`}
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
            {checked ? (
              <FormatPicker
                platform={account.platform}
                accountName={account.displayName}
                value={format}
                mediaCount={mediaCount}
                onChange={(next) => onFormatChange(account.id, next)}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
