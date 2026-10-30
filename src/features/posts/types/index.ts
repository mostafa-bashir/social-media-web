import { z } from "zod";

import { platformSchema } from "@/config/platforms";
import { mediaAssetSchema } from "@/lib/media";
import { postMetricsSchema } from "@/lib/post-metrics";

export const POST_STATUSES = [
  "draft",
  "in_review",
  "changes_requested",
  "scheduled",
  "publishing",
  "published",
  "partially_failed",
  "failed",
] as const;
export const postStatusSchema = z.enum(POST_STATUSES);
export type PostStatus = z.infer<typeof postStatusSchema>;

export const targetStatusSchema = z.enum([
  "pending",
  "publishing",
  "published",
  "failed",
]);
export type TargetStatus = z.infer<typeof targetStatusSchema>;

export const YOUTUBE_PRIVACY = ["private", "unlisted", "public"] as const;
export type YouTubePrivacy = (typeof YOUTUBE_PRIVACY)[number];

export const targetOptionsSchema = z.object({
  title: z.string().optional(),
  privacy: z.enum(YOUTUBE_PRIVACY).optional(),
});
export type TargetOptions = z.infer<typeof targetOptionsSchema>;

export const postTargetSchema = z.object({
  id: z.string(),
  socialAccountId: z.string().nullable(),
  platform: platformSchema,
  accountName: z.string(),
  status: targetStatusSchema,
  options: targetOptionsSchema,
  externalUrl: z.string().nullable(),
  lastError: z.string().nullable(),
  attempts: z.number(),
  publishedAt: z.string().nullable(),
  metrics: postMetricsSchema.nullable(),
});
export type PostTarget = z.infer<typeof postTargetSchema>;

export const postSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  caption: z.string(),
  status: postStatusSchema,
  scheduledAt: z.string().nullable(),
  media: z.array(mediaAssetSchema),
  targets: z.array(postTargetSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Post = z.infer<typeof postSchema>;

/** The slice of a social account the composer needs. */
export const composerAccountSchema = z.object({
  id: z.string(),
  platform: platformSchema,
  displayName: z.string(),
  avatarUrl: z.string().nullable(),
  status: z.enum(["active", "reconnect_required"]),
});
export type ComposerAccount = z.infer<typeof composerAccountSchema>;

export interface PostInput {
  caption: string;
  mediaIds: string[];
  targets: Array<{ socialAccountId: string; options?: TargetOptions }>;
}

export interface PostsQuery {
  page: number;
  pageSize: number;
  clientId?: string;
  status?: PostStatus;
  from?: string;
  to?: string;
}

/** Statuses in which a post can still be edited (mirrors the API). */
export const EDITABLE_STATUSES: readonly PostStatus[] = [
  "draft",
  "changes_requested",
  "scheduled",
];
