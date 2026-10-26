"use client";

import {
  EyeOutlined,
  HeartOutlined,
  PercentageOutlined,
  SendOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useTranslations } from "next-intl";

import StatCard from "@/components/ui/StatCard";

import { type Change, useMetricFormat } from "../hooks/use-metric-format";
import type { KpiTotals } from "../types";

export interface AnalyticsKpisProps {
  totals?: KpiTotals;
  previous?: KpiTotals;
  loading: boolean;
}

/** Headline figures for the range, each against the previous equal-length period. */
export default function AnalyticsKpis({
  totals,
  previous,
  loading,
}: AnalyticsKpisProps) {
  const t = useTranslations("analytics.kpis");
  const fmt = useMetricFormat();
  const trend = (change: Change | null) =>
    change
      ? {
          trend: t("vsPrevious", { change: change.label }),
          trendTone: change.tone,
        }
      : {};
  const followerChange = totals?.followerChange ?? null;

  return (
    <div className="surface-card">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label={t("followers")}
          value={fmt.count(totals?.followers ?? null)}
          loading={loading}
          icon={<TeamOutlined />}
          {...(followerChange !== null && followerChange !== 0
            ? {
                trend: fmt.signed(followerChange),
                trendTone: followerChange > 0 ? "growth" : "danger",
              }
            : {})}
        />
        <StatCard
          label={t("views")}
          value={fmt.count(totals?.views ?? null)}
          loading={loading}
          icon={<EyeOutlined />}
          {...trend(fmt.change(totals?.views ?? null, previous?.views ?? null))}
        />
        <StatCard
          label={t("engagements")}
          value={fmt.count(totals?.engagements ?? null)}
          loading={loading}
          icon={<HeartOutlined />}
          {...trend(
            fmt.change(
              totals?.engagements ?? null,
              previous?.engagements ?? null,
            ),
          )}
        />
        <StatCard
          label={t("engagementRate")}
          value={fmt.percent(totals?.engagementRate ?? null)}
          loading={loading}
          icon={<PercentageOutlined />}
        />
        <StatCard
          label={t("postsPublished")}
          value={fmt.exact(totals?.postsPublished ?? null)}
          loading={loading}
          icon={<SendOutlined />}
          {...trend(
            fmt.change(
              totals?.postsPublished ?? null,
              previous?.postsPublished ?? null,
            ),
          )}
        />
      </div>
    </div>
  );
}
