import { z } from "zod";

const count = z.number().nullable();

/** Latest synced counters of one published post; `null` = the platform doesn't report it. */
export const postMetricsSchema = z.object({
  views: count,
  reach: count,
  likes: count,
  comments: count,
  shares: count,
  saves: count,
  engagements: count,
  watchTimeMinutes: count,
  fetchedAt: z.string(),
});
export type PostMetrics = z.infer<typeof postMetricsSchema>;
