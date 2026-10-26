import { z } from "zod";

const average = z.number().nullable();

export const contentInsightsSchema = z.object({
  postsAnalyzed: z.number(),
  truncated: z.boolean(),
  timezone: z.string(),
  byContentType: z.array(
    z.object({
      contentType: z.string().nullable(),
      posts: z.number(),
      measuredPosts: z.number(),
      avgViews: average,
      avgEngagements: average,
      avgEngagementRate: average,
    }),
  ),
  bestTimes: z.array(
    z.object({
      weekday: z.number().int().min(1).max(7),
      hour: z.number().int().min(0).max(23),
      posts: z.number(),
      avgEngagements: z.number(),
      lowSample: z.boolean(),
    }),
  ),
  recommendedSlots: z.array(
    z.object({
      weekday: z.number(),
      hour: z.number(),
      posts: z.number(),
      avgEngagements: z.number(),
      lowSample: z.boolean(),
    }),
  ),
  postingFrequency: z.array(
    z.object({
      weekStart: z.string(),
      posts: z.number(),
      avgEngagements: average,
    }),
  ),
  hashtags: z.array(
    z.object({
      tag: z.string(),
      posts: z.number(),
      avgEngagements: z.number(),
    }),
  ),
  captionLengths: z.array(
    z.object({
      bucket: z.enum(["none", "short", "medium", "long", "veryLong"]),
      posts: z.number(),
      avgEngagements: average,
    }),
  ),
});
export type ContentInsights = z.infer<typeof contentInsightsSchema>;
export type TimeSlot = ContentInsights["bestTimes"][number];

const trendSource = <T extends z.ZodType>(item: T) =>
  z.object({
    status: z.enum(["ok", "unavailable", "not_configured"]),
    fetchedAt: z.string().nullable(),
    items: z.array(item),
  });

const liftSchema = z.object({
  key: z.string(),
  recentPosts: z.number(),
  recentAvgEngagements: z.number(),
  baselineAvgEngagements: z.number(),
  lift: z.number(),
});
export type Lift = z.infer<typeof liftSchema>;

export const trendsSchema = z.object({
  country: z.string(),
  youtube: trendSource(
    z.object({
      title: z.string(),
      channel: z.string(),
      url: z.url(),
      thumbnailUrl: z.url().nullable(),
      views: z.number().nullable(),
    }),
  ),
  searches: trendSource(
    z.object({
      query: z.string(),
      traffic: z.string().nullable(),
      url: z.url(),
    }),
  ),
  whatWorks: z.object({
    recentDays: z.number(),
    baselineDays: z.number(),
    hashtags: z.array(liftSchema),
    contentTypes: z.array(liftSchema),
  }),
});
export type Trends = z.infer<typeof trendsSchema>;
