"use client";

import { useFormatter, useNow, useTranslations } from "next-intl";

import type { PostMetrics } from "@/lib/post-metrics";

import { useMetricFormat } from "../hooks/use-metric-format";
import type { PostDetail } from "../types";

const COUNTERS = [
  "views",
  "reach",
  "engagements",
  "likes",
  "comments",
  "shares",
  "saves",
  "watchTimeMinutes",
] as const;
const TONE_CLASS = {
  growth: "text-growth-text",
  danger: "text-danger-text",
  neutral: "text-text-tertiary",
} as const;

/** Every counter the platform reports, the key ones against the account's average post. */
export default function PostMetricsGrid({
  metrics,
  average,
}: {
  metrics: PostMetrics;
  average: PostDetail["accountAverage"];
}) {
  const t = useTranslations("analytics.post");
  const tColumns = useTranslations("analytics.posts.columns");
  const format = useFormatter();
  const now = useNow();
  const fmt = useMetricFormat();
  const rate =
    metrics.engagements !== null && metrics.views
      ? metrics.engagements / metrics.views
      : null;

  const vsAverage = (value: number | null, base: number | null | undefined) => {
    const change = fmt.change(value, base ?? null);
    return change ? (
      <span className={`text-xs ${TONE_CLASS[change.tone]}`}>
        {t("vsAverage", { change: change.label })}
      </span>
    ) : null;
  };

  const tiles = [
    ...COUNTERS.filter((key) => metrics[key] !== null).map((key) => ({
      key,
      label: tColumns(key),
      value: fmt.count(metrics[key]),
      note:
        key === "views" || key === "engagements"
          ? vsAverage(metrics[key], average?.[key])
          : null,
    })),
    ...(rate !== null
      ? [
          {
            key: "rate",
            label: tColumns("engagementRate"),
            value: fmt.percent(rate),
            note: vsAverage(rate, average?.engagementRate),
          },
        ]
      : []),
  ];

  return (
    <section className="flex flex-col gap-2">
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {tiles.map((tile) => (
          <div
            key={tile.key}
            className="surface-panel flex flex-col gap-1 p-3!"
          >
            <dt className="text-xs text-text-tertiary">{tile.label}</dt>
            <dd className="text-xl font-semibold text-text-primary tabular-nums">
              {tile.value}
            </dd>
            {tile.note}
          </div>
        ))}
      </dl>
      <p className="text-xs text-text-tertiary">
        {t("updated", {
          when: format.relativeTime(new Date(metrics.fetchedAt), now),
        })}
        {average ? ` · ${t("averageOf", { count: average.posts })}` : null}
      </p>
    </section>
  );
}
