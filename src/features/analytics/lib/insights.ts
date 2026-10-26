import type { SocialPlatform } from "@/config/platforms";

import type { AnalyticsOverview, KpiTotals } from "../types";

/** Changes smaller than this are noise, not news. */
const NOTABLE_CHANGE = 0.05;
const DAYS_PER_WEEK = 7;
const MS_PER_DAY = 24 * 60 * 60_000;
const CHANGE_METRICS = [
  "views",
  "engagements",
  "avgEngagementPerPost",
] as const satisfies readonly (keyof KpiTotals)[];

export type Insight =
  | {
      kind: "change";
      metric: (typeof CHANGE_METRICS)[number];
      ratio: number;
    }
  | { kind: "followers"; net: number }
  | { kind: "topPlatform"; platform: SocialPlatform; rate: number }
  | { kind: "cadence"; perWeek: number };

const relativeChange = (current: number | null, previous: number | null) =>
  current === null || previous === null || previous === 0
    ? null
    : (current - previous) / previous;

/**
 * Plain-language highlights computed from the overview already on screen:
 * the biggest notable change, follower growth, the platform with the best
 * engagement rate, and how often the accounts post. Most important first.
 */
export function deriveInsights(overview: AnalyticsOverview): Insight[] {
  const { totals, comparisonTotals, platforms, range } = overview;
  const insights: Insight[] = [];

  const changes = CHANGE_METRICS.flatMap((metric) => {
    const ratio = relativeChange(
      totals[metric],
      comparisonTotals?.[metric] ?? null,
    );
    return ratio !== null && Math.abs(ratio) >= NOTABLE_CHANGE
      ? [{ kind: "change" as const, metric, ratio }]
      : [];
  }).sort((a, b) => Math.abs(b.ratio) - Math.abs(a.ratio));
  insights.push(...changes.slice(0, 2));

  if (totals.followerChange) {
    insights.push({ kind: "followers", net: totals.followerChange });
  }

  const rated = platforms.flatMap(({ platform, totals: row }) =>
    row.engagementRate !== null ? [{ platform, rate: row.engagementRate }] : [],
  );
  if (rated.length > 1) {
    const best = rated.reduce((top, entry) =>
      entry.rate > top.rate ? entry : top,
    );
    insights.push({ kind: "topPlatform", ...best });
  }

  const days = (Date.parse(range.to) - Date.parse(range.from)) / MS_PER_DAY + 1;
  if (totals.postsPublished > 0 && days >= DAYS_PER_WEEK) {
    insights.push({
      kind: "cadence",
      perWeek: (totals.postsPublished / days) * DAYS_PER_WEEK,
    });
  }
  return insights;
}
