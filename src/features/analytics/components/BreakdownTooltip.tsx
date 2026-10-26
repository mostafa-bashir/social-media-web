"use client";

import { useTranslations } from "next-intl";
import type { TooltipContentProps } from "recharts";

import { useBucketLabel } from "../hooks/use-bucket-label";
import { useMetricFormat } from "../hooks/use-metric-format";
import type { Granularity } from "../types";
import type { BreakdownPart, BreakdownRow } from "./BreakdownBarsChart";

/** Hover read-out for a breakdown bar: every part's value, as a positive count. */
export default function BreakdownTooltip({
  active,
  payload,
  label,
  parts,
  granularity,
}: Pick<TooltipContentProps<number, string>, "active" | "payload" | "label"> & {
  parts: BreakdownPart[];
  granularity: Granularity;
}) {
  const t = useTranslations("analytics.trend");
  const fmt = useMetricFormat();
  const bucketLabel = useBucketLabel(granularity);
  if (!active || !payload?.length || typeof label !== "string") return null;
  const row = payload[0].payload as BreakdownRow;

  return (
    <div className="surface-panel min-w-44 shadow-lg">
      <p className="mb-2 text-xs font-medium text-text-secondary">
        {bucketLabel(label, "long")}
      </p>
      <ul className="flex flex-col gap-1">
        {parts.map((part) => {
          const value = row[part.metric];
          return (
            <li
              key={part.metric}
              className="flex items-center justify-between gap-4 text-sm"
            >
              <span className="flex items-center gap-2 text-text-secondary">
                <span
                  aria-hidden
                  className="h-2 w-2 rounded-sm"
                  style={{ backgroundColor: part.stroke }}
                />
                {t(`metrics.${part.metric}`)}
              </span>
              <span className="font-medium text-text-primary tabular-nums">
                {fmt.exact(value === undefined ? null : Math.abs(value))}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
