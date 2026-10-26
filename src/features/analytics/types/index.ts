import { z } from "zod";

import { platformSchema, type SocialPlatform } from "@/config/platforms";
import { mediaKindSchema } from "@/lib/media";
import { postMetricsSchema } from "@/lib/post-metrics";

const count = z.number().nullable();

export const kpiTotalsSchema = z.object({
  followers: count,
  followerChange: count,
  views: count,
  engagements: count,
  engagementRate: count,
  watchTimeMinutes: count,
  postsPublished: z.number(),
});
export type KpiTotals = z.infer<typeof kpiTotalsSchema>;

export const analyticsAccountSchema = kpiTotalsSchema.extend({
  id: z.string(),
  clientId: z.string(),
  platform: platformSchema,
  displayName: z.string(),
  avatarUrl: z.string().nullable(),
  analyticsEnabled: z.boolean(),
  analyticsSyncedAt: z.string().nullable(),
  analyticsError: z.string().nullable(),
});
export type AnalyticsAccount = z.infer<typeof analyticsAccountSchema>;

const dayRangeSchema = z.object({ from: z.string(), to: z.string() });

export const overviewSchema = z.object({
  range: dayRangeSchema,
  previousRange: dayRangeSchema,
  totals: kpiTotalsSchema,
  previousTotals: kpiTotalsSchema,
  platforms: z.array(
    z.object({ platform: platformSchema, totals: kpiTotalsSchema }),
  ),
  accounts: z.array(analyticsAccountSchema),
});
export type AnalyticsOverview = z.infer<typeof overviewSchema>;

export const TREND_METRICS = [
  "views",
  "engagements",
  "followers",
  "watchTimeMinutes",
] as const;
export type TrendMetric = (typeof TREND_METRICS)[number];

export const timeseriesSchema = z.object({
  metric: z.enum(TREND_METRICS),
  series: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      platform: platformSchema.nullable(),
      points: z.array(z.object({ date: z.string(), value: z.number() })),
    }),
  ),
});
export type Timeseries = z.infer<typeof timeseriesSchema>;

export const analyticsPostSchema = z.object({
  id: z.string(),
  /** `external` = found on the account, not published from the app. */
  source: z.enum(["app", "external"]),
  postId: z.string().nullable(),
  clientId: z.string(),
  platform: platformSchema,
  accountName: z.string(),
  caption: z.string(),
  thumbnail: z
    .object({
      kind: mediaKindSchema,
      url: z.string(),
      originalFilename: z.string(),
    })
    .nullable(),
  externalUrl: z.string().nullable(),
  publishedAt: z.string(),
  metrics: postMetricsSchema.nullable(),
});
export type AnalyticsPost = z.infer<typeof analyticsPostSchema>;

export const POST_SORTS = ["views", "engagements", "publishedAt"] as const;
export type PostSort = (typeof POST_SORTS)[number];

export const RANGE_PRESETS = [7, 30, 90] as const;
export type RangePreset = (typeof RANGE_PRESETS)[number];

/** What every report is scoped by; dates are inclusive `YYYY-MM-DD` days. */
export interface AnalyticsScope {
  from: string;
  to: string;
  clientId?: string;
  platform?: SocialPlatform;
  timezone: string;
}
