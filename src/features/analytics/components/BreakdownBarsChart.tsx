"use client";

import { Segmented, Skeleton } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useMetricSeries } from "../api/get-analytics";
import { useBucketLabel } from "../hooks/use-bucket-label";
import { useMetricFormat } from "../hooks/use-metric-format";
import {
  type AnalyticsScope,
  GRANULARITIES,
  type Granularity,
  type TrendMetric,
} from "../types";
import BreakdownTooltip from "./BreakdownTooltip";

const CHART_HEIGHT = 240;
const AXIS_TICK = { fill: "var(--ds-text-tertiary)", fontSize: 12 };
const STACK_ID = "breakdown";

export interface BreakdownPart {
  metric: TrendMetric;
  stroke: string;
  /** Drawn below the baseline (e.g. followers lost). */
  negate?: boolean;
}

export type BreakdownRow = { date: string } & Partial<
  Record<TrendMetric, number>
>;

/** Several metrics per bucket as stacked bars; parts that subtract hang below zero. */
export default function BreakdownBarsChart({
  title,
  scope,
  parts,
}: {
  title: string;
  scope: AnalyticsScope;
  parts: BreakdownPart[];
}) {
  const t = useTranslations("analytics.trend");
  const fmt = useMetricFormat();
  const [granularity, setGranularity] = useState<Granularity>("week");
  const bucketLabel = useBucketLabel(granularity);
  const queries = useMetricSeries(
    scope,
    parts.map((part) => part.metric),
    granularity,
  );
  const loading = queries.some((query) => query.isLoading);

  const byDate = new Map<string, BreakdownRow>();
  parts.forEach((part, index) => {
    for (const point of queries[index]?.data?.series[0]?.points ?? []) {
      const row = byDate.get(point.date) ?? { date: point.date };
      row[part.metric] = part.negate ? -point.value : point.value;
      byDate.set(point.date, row);
    }
  });
  const rows = [...byDate.values()].sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  // A part no account reports (e.g. Instagram's lost followers) stays out of the legend.
  const shownParts = parts.filter((part) =>
    rows.some((row) => row[part.metric] !== undefined),
  );
  if (!loading && rows.length === 0) return null;
  return (
    <section className="surface-card flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-text-primary">{title}</h2>
        <Segmented<Granularity>
          aria-label={t("granularity")}
          value={granularity}
          options={GRANULARITIES.map((value) => ({
            value,
            label: t(`granularities.${value}`),
          }))}
          onChange={setGranularity}
        />
      </div>
      {loading ? (
        <Skeleton.Node active className="h-60! w-full!" />
      ) : (
        <>
          <ul className="flex flex-wrap gap-4" aria-label={t("legend")}>
            {shownParts.map((part) => (
              <li
                key={part.metric}
                className="flex items-center gap-2 text-sm text-text-secondary"
              >
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: part.stroke }}
                />
                {t(`metrics.${part.metric}`)}
              </li>
            ))}
          </ul>
          <div dir="ltr">
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
              <BarChart data={rows} stackOffset="sign" barCategoryGap="20%">
                <CartesianGrid
                  vertical={false}
                  stroke="var(--ds-border-secondary)"
                />
                <XAxis
                  dataKey="date"
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(date: string) => bucketLabel(date, "short")}
                  minTickGap={16}
                />
                <YAxis
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  tickFormatter={(value: number) => fmt.count(Math.abs(value))}
                />
                <ReferenceLine y={0} stroke="var(--ds-border-default)" />
                <Tooltip
                  cursor={{ fill: "var(--ds-bg-tertiary)" }}
                  content={(props) => (
                    <BreakdownTooltip
                      {...props}
                      parts={parts}
                      granularity={granularity}
                    />
                  )}
                />
                {parts.map((part) => (
                  <Bar
                    key={part.metric}
                    dataKey={part.metric}
                    stackId={STACK_ID}
                    fill={part.stroke}
                    stroke="var(--ds-bg-surface)"
                    strokeWidth={1}
                    isAnimationActive={false}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </section>
  );
}
