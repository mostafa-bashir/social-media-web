"use client";

import { Segmented, Skeleton } from "antd";
import { useFormatter, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ListingEmptyState from "@/components/ui/ListingEmptyState";
import type { SocialPlatform } from "@/config/platforms";
import { dayjs } from "@/lib/dayjs";

import { useAnalyticsTimeseries } from "../api/get-analytics";
import { useMetricFormat } from "../hooks/use-metric-format";
import { PLATFORM_SERIES } from "../lib/platform-series";
import { type AnalyticsScope, TREND_METRICS, type TrendMetric } from "../types";
import TrendTooltip from "./TrendTooltip";

const CHART_HEIGHT = 280;
const AXIS_TICK = { fill: "var(--ds-text-tertiary)", fontSize: 12 };

type Row = { date: string } & Partial<Record<SocialPlatform, number>>;

/** One line per platform over the range; days a platform didn't report stay gaps. */
export default function AnalyticsTrendChart({
  scope,
}: {
  scope: AnalyticsScope;
}) {
  const t = useTranslations("analytics.trend");
  const tPlatforms = useTranslations("common.platforms");
  const fmt = useMetricFormat();
  const format = useFormatter();
  const [metric, setMetric] = useState<TrendMetric>("views");
  const series = useAnalyticsTimeseries(scope, metric);

  const { rows, platforms } = useMemo(() => {
    const byDate = new Map<string, Row>();
    const present: SocialPlatform[] = [];
    for (const line of series.data?.series ?? []) {
      if (!line.platform) continue;
      present.push(line.platform);
      for (const point of line.points) {
        const row = byDate.get(point.date) ?? { date: point.date };
        row[line.platform] = point.value;
        byDate.set(point.date, row);
      }
    }
    const sorted = [...byDate.values()].sort((a, b) =>
      a.date.localeCompare(b.date),
    );
    return { rows: sorted, platforms: present };
  }, [series.data]);

  return (
    <section className="surface-card flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-text-primary">
          {t("title")}
        </h2>
        <Segmented<TrendMetric>
          aria-label={t("metric")}
          className="max-w-full overflow-x-auto"
          value={metric}
          options={TREND_METRICS.map((value) => ({
            value,
            label: t(`metrics.${value}`),
          }))}
          onChange={setMetric}
        />
      </div>
      {series.isLoading ? (
        <Skeleton.Node active className="h-70! w-full!" />
      ) : rows.length === 0 ? (
        <ListingEmptyState compact title={t("empty")} />
      ) : (
        <>
          <ul className="flex flex-wrap gap-4" aria-label={t("legend")}>
            {platforms.map((platform) => (
              <li
                key={platform}
                className="flex items-center gap-2 text-sm text-text-secondary"
              >
                <span
                  aria-hidden
                  className={`h-0.5 w-4 rounded-full ${PLATFORM_SERIES[platform].swatchClass}`}
                />
                {tPlatforms(platform)}
              </li>
            ))}
          </ul>
          <div dir="ltr">
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
              <LineChart
                data={rows}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="var(--ds-border-secondary)"
                />
                <XAxis
                  dataKey="date"
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={{ stroke: "var(--ds-border-default)" }}
                  tickFormatter={(date: string) =>
                    format.dateTime(dayjs(date).toDate(), {
                      day: "numeric",
                      month: "short",
                    })
                  }
                  minTickGap={24}
                />
                <YAxis
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  tickFormatter={(value: number) => fmt.count(value)}
                />
                <Tooltip
                  content={(props) => <TrendTooltip {...props} />}
                  cursor={{ stroke: "var(--ds-border-default)" }}
                />
                {platforms.map((platform) => (
                  <Line
                    key={platform}
                    dataKey={platform}
                    name={tPlatforms(platform)}
                    stroke={PLATFORM_SERIES[platform].stroke}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{
                      r: 4,
                      strokeWidth: 2,
                      stroke: "var(--ds-bg-surface)",
                    }}
                    connectNulls={false}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </section>
  );
}
