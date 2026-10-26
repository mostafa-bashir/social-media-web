import type { Timeseries, TrendGroup, TrendSeries } from "../types";
import { CATEGORICAL_STROKES, PLATFORM_SERIES } from "./platform-series";

/** More lines than this stop being readable; the rest are left out and said so. */
export const MAX_ACCOUNT_LINES = CATEGORICAL_STROKES.length;
export const COMPARISON_PREFIX = "comparison:";
export const POSTS_KEY = "posts";
export const MARKER_KEY = "postMarker";

export type TrendRow = { date: string } & Record<string, number | string>;

export interface TrendLine {
  dataKey: string;
  /** Platform id, account name, or `total`. */
  label: string;
  platform: TrendSeries["platform"];
  stroke: string;
  dashed: boolean;
}

const total = (series: TrendSeries) =>
  series.points.reduce((sum, point) => sum + point.value, 0);

/**
 * Pivots the series into one row per bucket for the chart. Platforms keep
 * their own colour; accounts take the categorical slots in name order and
 * only the largest few are drawn. The comparison overlays only the total.
 */
export function buildTrendRows(
  data: Timeseries | undefined,
  group: TrendGroup,
) {
  const byDate = new Map<string, TrendRow>();
  const row = (date: string) => {
    const existing = byDate.get(date) ?? { date };
    byDate.set(date, existing);
    return existing;
  };

  let series = data?.series ?? [];
  const hiddenAccounts =
    group === "account" ? Math.max(0, series.length - MAX_ACCOUNT_LINES) : 0;
  if (hiddenAccounts > 0) {
    series = [...series]
      .sort((a, b) => total(b) - total(a))
      .slice(0, MAX_ACCOUNT_LINES);
  }
  series = [...series].sort((a, b) => a.label.localeCompare(b.label));

  const lines: TrendLine[] = series.map((entry, index) => ({
    dataKey: entry.key,
    label: entry.label,
    platform: entry.platform,
    stroke:
      group === "platform" && entry.platform
        ? PLATFORM_SERIES[entry.platform].stroke
        : CATEGORICAL_STROKES[index],
    dashed: false,
  }));
  for (const entry of series) {
    for (const point of entry.points) row(point.date)[entry.key] = point.value;
  }

  if (group === "total") {
    for (const entry of data?.comparison ?? []) {
      const dataKey = `${COMPARISON_PREFIX}${entry.key}`;
      lines.push({
        dataKey,
        label: entry.label,
        platform: null,
        stroke: "var(--ds-text-tertiary)",
        dashed: true,
      });
      for (const point of entry.points) row(point.date)[dataKey] = point.value;
    }
  }
  // Post markers sit on the baseline, only under buckets that have data.
  for (const publication of data?.publications ?? []) {
    const existing = byDate.get(publication.date);
    if (!existing) continue;
    existing[POSTS_KEY] = publication.count;
    existing[MARKER_KEY] = 0;
  }

  const rows = [...byDate.values()].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  return { rows, lines, hiddenAccounts };
}
