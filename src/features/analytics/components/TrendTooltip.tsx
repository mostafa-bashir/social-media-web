"use client";

import { useTranslations } from "next-intl";
import type { TooltipContentProps } from "recharts";

import { useBucketLabel } from "../hooks/use-bucket-label";
import { useLineLabel } from "../hooks/use-line-label";
import { useMetricFormat } from "../hooks/use-metric-format";
import { POSTS_KEY, type TrendLine, type TrendRow } from "../lib/trend-rows";
import type { CompareMode, Granularity, TrendMetric } from "../types";

export type TrendTooltipProps = Pick<
  TooltipContentProps<number, string>,
  "active" | "payload" | "label"
> & {
  lines: TrendLine[];
  metric: TrendMetric;
  granularity: Granularity;
  compare: CompareMode;
};

/** Crosshair read-out: the bucket, each line's value in legend order, and posts published. */
export default function TrendTooltip({
  active,
  payload,
  label,
  lines,
  metric,
  granularity,
  compare,
}: TrendTooltipProps) {
  const t = useTranslations("analytics.trend");
  const fmt = useMetricFormat();
  const bucketLabel = useBucketLabel(granularity);
  const lineLabel = useLineLabel(compare);
  if (!active || !payload?.length || typeof label !== "string") return null;

  const row = payload[0].payload as TrendRow;
  const value = (key: string) => {
    const raw = row[key];
    const number = typeof raw === "number" ? raw : null;
    return metric === "engagementRate"
      ? fmt.percent(number)
      : fmt.exact(number);
  };
  const posts = typeof row[POSTS_KEY] === "number" ? row[POSTS_KEY] : 0;

  return (
    <div className="surface-panel min-w-44 shadow-lg">
      <p className="mb-2 text-xs font-medium text-text-secondary">
        {bucketLabel(label, "long")}
      </p>
      <ul className="flex flex-col gap-1">
        {lines.map((line) => (
          <li
            key={line.dataKey}
            className="flex items-center justify-between gap-4 text-sm"
          >
            <span className="flex items-center gap-2 text-text-secondary">
              <span
                aria-hidden
                className={`w-3 border-t-2 ${line.dashed ? "border-dashed" : ""}`}
                style={{ borderColor: line.stroke }}
              />
              {lineLabel(line)}
            </span>
            <span className="font-medium text-text-primary tabular-nums">
              {value(line.dataKey)}
            </span>
          </li>
        ))}
      </ul>
      {posts > 0 ? (
        <p className="mt-2 border-t border-border-secondary pt-2 text-xs text-text-tertiary">
          {t("postsInBucket", { count: posts })}
        </p>
      ) : null}
    </div>
  );
}
