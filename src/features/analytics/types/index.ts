import { z } from "zod";

import { platformSchema, type SocialPlatform } from "@/config/platforms";
import { mediaKindSchema } from "@/lib/media";
import { postMetricsSchema } from "@/lib/post-metrics";

const count = z.number().nullable();

export const kpiTotalsSchema = z.object({
  followers: count,
  followerChange: count,
  followersGained: count,
  followersLost: count,
  views: count,
  engagements: count,
  engagementRate: count,
  likes: count,
  comments: count,
  shares: count,
  saves: count,
  watchTimeMinutes: count,
  profileViews: count,
  postsPublished: z.number(),
  postsMeasured: z.number(),
  postEngagements: count,
  avgEngagementPerPost: count,
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
  comparisonRange: dayRangeSchema.nullable(),
  totals: kpiTotalsSchema,
  comparisonTotals: kpiTotalsSchema.nullable(),
  platforms: z.array(
    z.object({ platform: platformSchema, totals: kpiTotalsSchema }),
  ),
  accounts: z.array(analyticsAccountSchema),
});
export type AnalyticsOverview = z.infer<typeof overviewSchema>;

export const TREND_METRICS = [
  "views",
  "engagements",
  "engagementRate",
  "likes",
  "comments",
  "shares",
  "saves",
  "watchTimeMinutes",
  "followers",
  "followersGained",
  "followersLost",
  "profileViews",
] as const;
export type TrendMetric = (typeof TREND_METRICS)[number];

export const TREND_GROUPS = ["total", "platform", "account"] as const;
export type TrendGroup = (typeof TREND_GROUPS)[number];

export const GRANULARITIES = ["day", "week", "month"] as const;
export type Granularity = (typeof GRANULARITIES)[number];

const seriesSchema = z.object({
  key: z.string(),
  label: z.string(),
  platform: platformSchema.nullable(),
  points: z.array(z.object({ date: z.string(), value: z.number() })),
});
export type TrendSeries = z.infer<typeof seriesSchema>;

export const timeseriesSchema = z.object({
  metric: z.enum(TREND_METRICS),
  granularity: z.enum(GRANULARITIES),
  series: z.array(seriesSchema),
  comparison: z.array(seriesSchema).nullable(),
  publications: z.array(z.object({ date: z.string(), count: z.number() })),
});
export type Timeseries = z.infer<typeof timeseriesSchema>;

export const CONTENT_TYPES = [
  "image",
  "video",
  "reel",
  "carousel",
  "text",
] as const;
export const contentTypeSchema = z.enum(CONTENT_TYPES);
export type ContentType = z.infer<typeof contentTypeSchema>;

export const POST_SOURCES = ["app", "external"] as const;
export type PostSource = (typeof POST_SOURCES)[number];

export const analyticsPostSchema = z.object({
  id: z.string(),
  /** `external` = found on the account, not published from the app. */
  source: z.enum(POST_SOURCES),
  postId: z.string().nullable(),
  clientId: z.string(),
  accountId: z.string().nullable(),
  platform: platformSchema,
  accountName: z.string(),
  contentType: contentTypeSchema.nullable(),
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

const postCountersSchema = postMetricsSchema.omit({ fetchedAt: true });

export const postDetailSchema = z.object({
  post: analyticsPostSchema,
  history: z.array(postCountersSchema.extend({ date: z.string() })),
  accountAverage: z
    .object({
      posts: z.number(),
      views: count,
      engagements: count,
      engagementRate: count,
    })
    .nullable(),
});
export type PostDetail = z.infer<typeof postDetailSchema>;

export const POST_SORTS = [
  "views",
  "engagements",
  "engagementRate",
  "reach",
  "likes",
  "comments",
  "shares",
  "saves",
  "publishedAt",
] as const;
export type PostSort = (typeof POST_SORTS)[number];

export interface PostFilters {
  accountId?: string;
  contentType?: ContentType;
  search?: string;
}

export const RANGE_PRESETS = [7, 30, 90] as const;
export type RangePreset = (typeof RANGE_PRESETS)[number];

export const COMPARE_MODES = ["previous", "year", "none"] as const;
export type CompareMode = (typeof COMPARE_MODES)[number];

/** What every report is scoped by; dates are inclusive `YYYY-MM-DD` days. */
export interface AnalyticsScope {
  from: string;
  to: string;
  clientId?: string;
  platform?: SocialPlatform;
  accountId?: string;
  timezone: string;
}
