"use client";

import {
  CalendarOutlined,
  ShopOutlined,
  TeamOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { useFormatter, useTranslations } from "next-intl";

import StatCard from "@/components/ui/StatCard";

import type { UsageOverview } from "../types/usage";

/** Headline numbers. Not charts: each is one figure plus its context. */
export default function UsageKpiTiles({
  overview,
  loading,
}: {
  overview: UsageOverview | undefined;
  loading: boolean;
}) {
  const t = useTranslations("admin.usage.kpis");
  const format = useFormatter();
  const kpis = overview?.kpis;
  const attempts = (kpis?.postsPublished ?? 0) + (kpis?.postsFailed ?? 0);
  const footer = (text: string) => (
    <span className="text-xs text-text-tertiary">{text}</span>
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        loading={loading}
        label={t("workspaces")}
        icon={<ShopOutlined />}
        value={format.number(kpis?.tenantsActive ?? 0)}
        footer={footer(
          t("workspacesFooter", {
            suspended: kpis?.tenantsSuspended ?? 0,
            created: kpis?.newTenants ?? 0,
          }),
        )}
      />
      <StatCard
        loading={loading}
        label={t("users")}
        icon={<TeamOutlined />}
        value={format.number(kpis?.users ?? 0)}
        footer={footer(t("usersFooter", { created: kpis?.newUsers ?? 0 }))}
      />
      <StatCard
        loading={loading}
        label={t("activeToday")}
        icon={<ThunderboltOutlined />}
        value={format.number(kpis?.dau ?? 0)}
        footer={footer(
          t("activeFooter", { wau: kpis?.wau ?? 0, mau: kpis?.mau ?? 0 }),
        )}
      />
      <StatCard
        loading={loading}
        label={t("postsPublished")}
        icon={<CalendarOutlined />}
        value={format.number(kpis?.postsPublished ?? 0)}
        footer={footer(
          attempts > 0
            ? t("postsFooter", {
                failed: kpis?.postsFailed ?? 0,
                rate: format.number((kpis?.postsPublished ?? 0) / attempts, {
                  style: "percent",
                  maximumFractionDigits: 1,
                }),
              })
            : t("postsFooterNone"),
        )}
      />
    </div>
  );
}
