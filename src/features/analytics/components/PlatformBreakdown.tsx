"use client";

import { Skeleton } from "antd";
import { useTranslations } from "next-intl";

import PlatformBadge from "@/components/ui/PlatformBadge";

import { useMetricFormat } from "../hooks/use-metric-format";
import { PLATFORM_SERIES } from "../lib/platform-series";
import type { AnalyticsOverview, KpiTotals } from "../types";

type Share = "views" | "engagements";
const SHARES: Share[] = ["views", "engagements"];

/** Each platform's share of views and engagements, with its own figures beside. */
export default function PlatformBreakdown({
  platforms,
  loading,
}: {
  platforms: AnalyticsOverview["platforms"];
  loading: boolean;
}) {
  const t = useTranslations("analytics.platforms");
  const fmt = useMetricFormat();
  const totalOf = (key: Share) =>
    platforms.reduce((sum, entry) => sum + (entry.totals[key] ?? 0), 0);
  const totals = {
    views: totalOf("views"),
    engagements: totalOf("engagements"),
  };
  const share = (totalsRow: KpiTotals, key: Share) =>
    totals[key] > 0 && totalsRow[key] !== null
      ? (totalsRow[key] ?? 0) / totals[key]
      : null;

  return (
    <section className="surface-card flex flex-col gap-4">
      <h2 className="text-base font-semibold text-text-primary">
        {t("title")}
      </h2>
      <div className="surface-panel flex flex-col gap-5">
        {loading ? (
          <Skeleton active paragraph={{ rows: 3 }} />
        ) : (
          platforms.map(({ platform, totals: row }) => (
            <div key={platform} className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <PlatformBadge platform={platform} />
                <span className="text-sm text-text-secondary">
                  {t("summary", {
                    followers: fmt.count(row.followers),
                    rate: fmt.percent(row.engagementRate),
                    posts: row.postsPublished,
                  })}
                </span>
              </div>
              {SHARES.map((key) => {
                const ratio = share(row, key);
                return (
                  <div key={key} className="flex items-center gap-3 text-sm">
                    <span className="w-28 shrink-0 text-text-tertiary">
                      {t(key)}
                    </span>
                    <span
                      aria-hidden
                      className="h-2 flex-1 rounded-full bg-background-tertiary"
                    >
                      {ratio ? (
                        <span
                          className={`block h-full rounded-full ${PLATFORM_SERIES[platform].swatchClass}`}
                          style={{ width: `${ratio * 100}%` }}
                        />
                      ) : null}
                    </span>
                    <span className="w-28 shrink-0 text-end text-text-primary tabular-nums">
                      {fmt.count(row[key])}{" "}
                      <span className="text-text-tertiary">
                        ({fmt.percent(ratio)})
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
