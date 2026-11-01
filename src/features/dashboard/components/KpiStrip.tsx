"use client";

import {
  EyeOutlined,
  HeartOutlined,
  PercentageOutlined,
  SyncOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import StatCard from "@/components/ui/StatCard";
import { Permission } from "@/config/permissions";
import { routes } from "@/config/routes";
import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { usePermissions } from "@/hooks/use-permissions";
import { Link } from "@/i18n/navigation";

import { type KpiTotals, useDashboardKpis } from "../api/get-dashboard-kpis";
import { useDashboardClient } from "../hooks/use-dashboard-client";
import { type KpiKind, useKpiFormat } from "../hooks/use-kpi-format";

const KPIS: Array<{ key: keyof KpiTotals; kind: KpiKind; icon: ReactNode }> = [
  { key: "views", kind: "count", icon: <EyeOutlined /> },
  { key: "engagements", kind: "count", icon: <HeartOutlined /> },
  { key: "engagementRate", kind: "percent", icon: <PercentageOutlined /> },
  { key: "followersGained", kind: "count", icon: <UserAddOutlined /> },
];

/** Last 7 days against the 7 before, from the synced analytics. */
export default function KpiStrip() {
  const t = useTranslations("dashboard.kpis");
  const slug = useActiveWorkspaceSlug() ?? "";
  const { can } = usePermissions();
  const { clientId } = useDashboardClient();
  const allowed = can(Permission.AnalyticsView);
  const kpis = useDashboardKpis(allowed, clientId);
  const format = useKpiFormat();

  if (!allowed) return null;
  const accounts = kpis.data?.accounts ?? [];
  const noAccounts = kpis.data !== undefined && accounts.length === 0;
  // Before the first sync every figure is unknown; say why instead of dashes.
  const neverSynced =
    accounts.length > 0 &&
    accounts.every((account) => account.analyticsSyncedAt === null);
  // Broken, permission-less or erroring accounts are never synced, so promising
  // "syncing" for them would be false.
  const syncFailing =
    neverSynced &&
    !accounts.some(
      (account) =>
        account.status === "active" &&
        account.analyticsEnabled &&
        account.analyticsError === null,
    );

  return (
    <section className="surface-card mb-6">
      <header className="flex items-center justify-between px-3 pb-2 pt-1">
        <h2 className="text-sm font-semibold text-text-secondary">
          {t("title")}
        </h2>
        <Link
          href={routes.workspace(slug).analytics}
          className="text-sm font-medium text-primary-text hover:underline"
        >
          {t("open")}
        </Link>
      </header>
      {kpis.isError ? (
        <p role="alert" className="surface-panel text-sm text-danger-text">
          {t("error")}
        </p>
      ) : noAccounts ? (
        <p className="surface-panel text-sm text-text-secondary">
          {t("noAccounts")}
        </p>
      ) : syncFailing ? (
        <p role="alert" className="surface-panel text-sm text-danger-text">
          {t.rich("syncFailing", {
            link: (chunks) => (
              <Link
                href={routes.workspace(slug).accounts}
                className="font-medium underline"
              >
                {chunks}
              </Link>
            ),
          })}
        </p>
      ) : neverSynced ? (
        <p
          role="status"
          className="surface-panel flex items-center gap-2 text-sm text-text-secondary"
        >
          <SyncOutlined spin aria-hidden className="text-primary-text" />
          {t("syncing")}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {KPIS.map(({ key, kind, icon }) => {
            const current = kpis.data?.totals[key] ?? null;
            const change = format.change(
              current,
              kpis.data?.comparisonTotals?.[key] ?? null,
            );
            return (
              <StatCard
                key={key}
                label={t(key)}
                value={format.value(kind, current)}
                icon={icon}
                loading={kpis.isLoading}
                trend={change?.label}
                trendTone={change?.tone}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
