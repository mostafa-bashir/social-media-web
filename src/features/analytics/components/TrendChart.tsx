"use client";

import { Segmented, Select, Skeleton } from "antd";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import ListingEmptyState from "@/components/ui/ListingEmptyState";

import { useAnalyticsTimeseries } from "../api/get-analytics";
import { buildTrendRows } from "../lib/trend-rows";
import {
  type AnalyticsScope,
  type CompareMode,
  GRANULARITIES,
  type Granularity,
  TREND_GROUPS,
  TREND_METRICS,
  type TrendGroup,
  type TrendMetric,
} from "../types";
import TrendLegend from "./TrendLegend";
import TrendPlot from "./TrendPlot";

export interface TrendChartProps {
  scope: AnalyticsScope;
  compare: CompareMode;
  /** Groupings offered; a single one hides the switch (e.g. one account). */
  groups?: readonly TrendGroup[];
}

/** A metric over time, split by platform or account, with the comparison overlaid. */
export default function TrendChart({
  scope,
  compare,
  groups = TREND_GROUPS,
}: TrendChartProps) {
  const t = useTranslations("analytics.trend");
  const [metric, setMetric] = useState<TrendMetric>("views");
  const [group, setGroup] = useState<TrendGroup>(groups[0]);
  const [granularity, setGranularity] = useState<Granularity>("day");
  const series = useAnalyticsTimeseries(scope, {
    metric,
    groupBy: group,
    granularity,
    compare,
  });
  const { rows, lines, hiddenAccounts } = useMemo(
    () => buildTrendRows(series.data, group),
    [series.data, group],
  );
  const hasData = lines.some((line) => !line.dashed);

  return (
    <section className="surface-card flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-text-primary">
          {t("title")}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <Select<TrendMetric>
            className="w-full sm:w-48!"
            aria-label={t("metric")}
            value={metric}
            options={TREND_METRICS.map((value) => ({
              value,
              label: t(`metrics.${value}`),
            }))}
            onChange={setMetric}
          />
          {groups.length > 1 ? (
            <Segmented<TrendGroup>
              aria-label={t("groupBy")}
              className="max-w-full overflow-x-auto"
              value={group}
              options={groups.map((value) => ({
                value,
                label: t(`groups.${value}`),
              }))}
              onChange={setGroup}
            />
          ) : null}
          <Segmented<Granularity>
            aria-label={t("granularity")}
            className="max-w-full overflow-x-auto"
            value={granularity}
            options={GRANULARITIES.map((value) => ({
              value,
              label: t(`granularities.${value}`),
            }))}
            onChange={setGranularity}
          />
        </div>
      </div>
      {series.isLoading ? (
        <Skeleton.Node active className="h-70! w-full!" />
      ) : !hasData ? (
        <ListingEmptyState compact title={t("empty")} />
      ) : (
        <>
          <TrendLegend lines={lines} compare={compare} />
          <TrendPlot
            rows={rows}
            lines={lines}
            metric={metric}
            granularity={granularity}
            compare={compare}
          />
          {granularity !== "day" ? (
            <p className="text-xs text-text-tertiary">{t("partialBuckets")}</p>
          ) : null}
          {hiddenAccounts > 0 ? (
            <p className="text-xs text-text-tertiary">
              {t("moreAccounts", { count: hiddenAccounts })}
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}
