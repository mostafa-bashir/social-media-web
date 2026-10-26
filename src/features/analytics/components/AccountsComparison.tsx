"use client";

import type { TableProps } from "antd";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import ListingTable from "@/components/ui/ListingTable";
import PlatformBadge from "@/components/ui/PlatformBadge";
import { routes } from "@/config/routes";
import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { Link } from "@/i18n/navigation";

import { useMetricFormat } from "../hooks/use-metric-format";
import { PLATFORM_SERIES } from "../lib/platform-series";
import type { AnalyticsAccount } from "../types";
import AccountSyncStatus from "./AccountSyncStatus";

/** Per-account figures side by side; the bar shows each account's share of the top views. */
export default function AccountsComparison({
  accounts,
  loading,
}: {
  accounts: AnalyticsAccount[];
  loading: boolean;
}) {
  const t = useTranslations("analytics.accounts");
  const fmt = useMetricFormat();
  const slug = useActiveWorkspaceSlug() ?? "";
  const query = Object.fromEntries(useSearchParams().entries());
  const topViews = Math.max(0, ...accounts.map((a) => a.views ?? 0));

  const columns: TableProps<AnalyticsAccount>["columns"] = [
    {
      title: t("columns.account"),
      key: "account",
      render: (_, account) => (
        <div className="flex min-w-0 flex-col gap-1">
          <Link
            href={{
              pathname: routes.workspace(slug).analyticsAccount(account.id),
              query,
            }}
            className="truncate font-medium text-text-primary hover:text-primary-text"
          >
            {account.displayName}
          </Link>
          <PlatformBadge platform={account.platform} />
        </div>
      ),
    },
    {
      title: t("columns.followers"),
      key: "followers",
      align: "end",
      render: (_, account) => (
        <span className="tabular-nums">
          {fmt.count(account.followers)}
          {account.followerChange ? (
            <span className="ms-1 text-xs text-text-tertiary">
              ({fmt.signed(account.followerChange)})
            </span>
          ) : null}
        </span>
      ),
    },
    {
      title: t("columns.views"),
      key: "views",
      render: (_, account) => (
        <div className="flex min-w-40 items-center gap-2">
          <span className="w-12 shrink-0 text-end tabular-nums">
            {fmt.count(account.views)}
          </span>
          <span aria-hidden className="h-2 flex-1">
            {account.views && topViews > 0 ? (
              <span
                className={`block h-full rounded-e-sm ${PLATFORM_SERIES[account.platform].swatchClass}`}
                style={{ width: `${(account.views / topViews) * 100}%` }}
              />
            ) : null}
          </span>
        </div>
      ),
    },
    {
      title: t("columns.engagements"),
      key: "engagements",
      align: "end",
      responsive: ["xl"],
      render: (_, account) => (
        <span className="tabular-nums">{fmt.count(account.engagements)}</span>
      ),
    },
    {
      title: t("columns.rate"),
      key: "rate",
      align: "end",
      responsive: ["xl"],
      render: (_, account) => (
        <span className="tabular-nums">
          {fmt.percent(account.engagementRate)}
        </span>
      ),
    },
    {
      title: t("columns.posts"),
      key: "posts",
      align: "end",
      responsive: ["xl"],
      render: (_, account) => (
        <span className="tabular-nums">{account.postsPublished}</span>
      ),
    },
    {
      title: t("columns.status"),
      key: "status",
      render: (_, account) => <AccountSyncStatus account={account} />,
    },
  ];

  return (
    <section className="surface-card flex flex-col gap-4">
      <h2 className="text-base font-semibold text-text-primary">
        {t("title")}
      </h2>
      <div className="surface-panel overflow-x-auto p-0!">
        <ListingTable<AnalyticsAccount>
          rowKey="id"
          columns={columns}
          dataSource={accounts}
          loading={loading}
          pagination={false}
          emptyTitle={t("empty")}
        />
      </div>
    </section>
  );
}
