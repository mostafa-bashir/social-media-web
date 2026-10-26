"use client";

import { ArrowLeftOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar } from "antd";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import PlatformBadge from "@/components/ui/PlatformBadge";
import { routes } from "@/config/routes";
import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { Link } from "@/i18n/navigation";

import type { AnalyticsAccount } from "../types";
import AccountSyncStatus from "./AccountSyncStatus";
import SyncNowButton from "./SyncNowButton";

const AVATAR_SIZE = 48;

/** Who this page is about, and the way back to every account. */
export default function AccountHeader({
  account,
}: {
  account: AnalyticsAccount;
}) {
  const t = useTranslations("analytics.account");
  const slug = useActiveWorkspaceSlug() ?? "";
  const query = Object.fromEntries(useSearchParams().entries());

  return (
    <div className="surface-card">
      <div className="surface-panel flex flex-wrap items-center gap-4">
        <Link
          href={{ pathname: routes.workspace(slug).analyticsAccounts, query }}
          aria-label={t("back")}
          className="grid h-9 w-9 place-items-center rounded-full text-text-secondary hover:bg-background-tertiary"
        >
          <ArrowLeftOutlined aria-hidden className="rtl:rotate-180" />
        </Link>
        <Avatar
          size={AVATAR_SIZE}
          src={account.avatarUrl ?? undefined}
          icon={<UserOutlined />}
          alt=""
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2 className="truncate text-lg font-semibold text-text-primary">
            {account.displayName}
          </h2>
          <PlatformBadge platform={account.platform} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <AccountSyncStatus account={account} />
          <SyncNowButton account={account} />
        </div>
      </div>
    </div>
  );
}
