"use client";

import { Segmented } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useBucketLabel } from "../hooks/use-bucket-label";
import { useMetricFormat } from "../hooks/use-metric-format";
import type { PostDetail } from "../types";

const CHART_HEIGHT = 180;
const AXIS_TICK = { fill: "var(--ds-text-tertiary)", fontSize: 12 };
const HISTORY_METRICS = ["views", "engagements", "likes", "comments"] as const;
type HistoryMetric = (typeof HISTORY_METRICS)[number];
/** A line needs two readings; until then say when it will appear. */
const MIN_POINTS = 2;

/** How the post's lifetime counters grew, one reading per sync day. */
export default function PostHistoryChart({
  history,
}: {
  history: PostDetail["history"];
}) {
  const t = useTranslations("analytics.post");
  const tColumns = useTranslations("analytics.posts.columns");
  const fmt = useMetricFormat();
  const dayLabel = useBucketLabel("day");
  const [metric, setMetric] = useState<HistoryMetric>("views");
  const available = HISTORY_METRICS.filter((key) =>
    history.some((point) => point[key] !== null),
  );
  const shown = available.includes(metric) ? metric : available[0];

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-text-primary">
          {t("history")}
        </h3>
        {available.length > 1 ? (
          <Segmented<HistoryMetric>
            size="small"
            aria-label={t("historyMetric")}
            value={shown}
            options={available.map((value) => ({
              value,
              label: tColumns(value),
            }))}
            onChange={setMetric}
          />
        ) : null}
      </div>
      {history.length < MIN_POINTS || !shown ? (
        <p className="text-sm text-text-tertiary">{t("historyPending")}</p>
      ) : (
        <div dir="ltr">
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <LineChart data={history} margin={{ top: 8, right: 8, left: 0 }}>
              <CartesianGrid
                vertical={false}
                stroke="var(--ds-border-secondary)"
              />
              <XAxis
                dataKey="date"
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
                tickFormatter={(date: string) => dayLabel(date, "short")}
                minTickGap={16}
              />
              <YAxis
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
                width={44}
                tickFormatter={(value: number) => fmt.count(value)}
              />
              <Tooltip
                labelFormatter={(date) => dayLabel(String(date), "long")}
                formatter={(value) => [
                  fmt.exact(typeof value === "number" ? value : null),
                  tColumns(shown),
                ]}
              />
              <Line
                dataKey={shown}
                stroke="var(--ds-chart-1)"
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
