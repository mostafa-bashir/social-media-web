"use client";

import { useMetricFormat } from "../hooks/use-metric-format";
import type { ShareRow } from "../types/audience";

/** Labelled shares with a bar each; the bar is relative to the largest share. */
export default function ShareList({
  rows,
  label,
  limit,
  emptyText,
}: {
  rows: ShareRow[];
  label: (key: string) => string;
  limit?: number;
  emptyText: string;
}) {
  const fmt = useMetricFormat();
  const shown = limit ? rows.slice(0, limit) : rows;
  const top = Math.max(...shown.map((row) => row.share), 0);

  if (shown.length === 0) {
    return <p className="text-sm text-text-tertiary">{emptyText}</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {shown.map((row) => (
        <li key={row.key} className="flex flex-col gap-1 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="min-w-0 truncate text-text-primary" dir="auto">
              {label(row.key)}
            </span>
            <span className="shrink-0 text-text-secondary tabular-nums">
              {fmt.percent(row.share)}
            </span>
          </div>
          <span
            aria-hidden
            className="h-1.5 rounded-full bg-background-tertiary"
          >
            <span
              className="block h-full rounded-full bg-chart-1"
              style={{ width: `${top > 0 ? (row.share / top) * 100 : 0}%` }}
            />
          </span>
        </li>
      ))}
    </ul>
  );
}
