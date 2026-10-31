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

/** How a target goes out; which formats a platform has is in `FORMAT_RULES`. */
export const TARGET_FORMATS = [
  "feed",
  "reel",
  "story",
  "video",
  "short",
] as const;
export const targetFormatSchema = z.enum(TARGET_FORMATS);
export type TargetFormat = z.infer<typeof targetFormatSchema>;

/** Each platform reads only its own fields (mirrors the API). */
export const targetOptionsSchema = z.object({
  title: z.string().optional(),
  privacy: z.enum(YOUTUBE_PRIVACY).optional(),
  link: z.string().optional(),
  shareToFeed: z.boolean().optional(),
  thumbOffsetMs: z.number().optional(),
  collaborators: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  categoryId: z.string().optional(),
  madeForKids: z.boolean().optional(),
  thumbnailMediaId: z.string().optional(),
});

export const FIRST_COMMENT_STATUSES = [
  "pending",
  "posting",
  "posted",
  "failed",
  "skipped",
] as const;
export type FirstCommentStatus = (typeof FIRST_COMMENT_STATUSES)[number];

/** YouTube's assignable categories (mirrors the API); names are translated. */
export const YOUTUBE_CATEGORY_IDS = [
  "1",
  "2",
  "10",
  "15",
  "17",
  "19",
  "20",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "28",
  "29",
] as const;
export const DEFAULT_YOUTUBE_CATEGORY = "22";
export type TargetOptions = z.infer<typeof targetOptionsSchema>;

export const postTargetSchema = z.object({
  id: z.string(),
  socialAccountId: z.string().nullable(),
  platform: platformSchema,
  accountName: z.string(),
  format: targetFormatSchema,
  /** Null when the account uses the post caption. */
  caption: z.string().nullable(),
  status: targetStatusSchema,
  warning: z.string().nullable(),
  firstComment: z
    .object({
      status: z.enum(FIRST_COMMENT_STATUSES),
      error: z.string().nullable(),
    })
    .nullable(),
  options: targetOptionsSchema,
  externalUrl: z.string().nullable(),
  lastError: z.string().nullable(),
  attempts: z.number(),
  publishedAt: z.string().nullable(),
  metrics: postMetricsSchema.nullable(),
});
export type PostTarget = z.infer<typeof postTargetSchema>;

export const postMediaSchema = mediaAssetSchema.extend({
  altText: z.string().nullable(),
});
export type PostMedia = z.infer<typeof postMediaSchema>;

export const REPEAT_FREQUENCIES = ["daily", "weekly", "monthly"] as const;
export type RepeatFrequency = (typeof REPEAT_FREQUENCIES)[number];

export interface RepeatRule {
  frequency: RepeatFrequency;
  interval: number;
  endsAfter?: number;
  until?: string;
}

export const postRepeatSchema = z.object({
  frequency: z.enum(REPEAT_FREQUENCIES),
  interval: z.number(),
  endsAfter: z.number().nullable(),
  until: z.string().nullable(),
  occurrence: z.number(),
  stopped: z.boolean(),
});
export type PostRepeat = z.infer<typeof postRepeatSchema>;

export const postSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  caption: z.string(),
  firstComment: z.string().nullable(),
  status: postStatusSchema,
  scheduledAt: z.string().nullable(),
  repeat: postRepeatSchema.nullable(),
  media: z.array(postMediaSchema),
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
  /** False: connected before comment permissions were asked for. */
  engagementEnabled: z.boolean(),
});
export type ComposerAccount = z.infer<typeof composerAccountSchema>;

export interface PostInput {
  caption: string;
  firstComment: string | null;
  /** Null stops the repeats; undefined leaves them as they are. */
  repeat?: RepeatRule | null;
  mediaIds: string[];
  altTexts: Array<{ mediaId: string; altText: string }>;
  targets: Array<{
    socialAccountId: string;
    format: TargetFormat;
    caption: string | null;
    options?: TargetOptions;
  }>;
}

export const duplicatePostSchema = z.object({
  post: postSchema,
  skippedTargets: z.number(),
});

export const SNIPPET_KINDS = ["hashtags", "snippet"] as const;
export type SnippetKind = (typeof SNIPPET_KINDS)[number];

export const captionSnippetSchema = z.object({
  id: z.string(),
  clientId: z.string().nullable(),
  kind: z.enum(SNIPPET_KINDS),
  name: z.string(),
  body: z.string(),
  updatedAt: z.string(),
});
export type CaptionSnippet = z.infer<typeof captionSnippetSchema>;

export interface CaptionSnippetInput {
  clientId?: string;
  kind: SnippetKind;
  name: string;
  body: string;
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

export const postingSlotSchema = z.object({
  /** ISO weekday, 1 = Monday. */
  weekday: z.number(),
  /** `HH:mm`, client local time. */
  localTime: z.string(),
});
export type PostingSlot = z.infer<typeof postingSlotSchema>;

export const postingSlotsSchema = z.object({
  timezone: z.string(),
  slots: z.array(postingSlotSchema),
});

export const importIssueSchema = z.object({
  code: z.string(),
  detail: z.string().optional(),
});
export type ImportIssue = z.infer<typeof importIssueSchema>;

export const importResultSchema = z.object({
  timezone: z.string(),
  rows: z.array(
    z.object({
      line: z.number(),
      scheduledAt: z.string().nullable(),
      accounts: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          platform: platformSchema,
        }),
      ),
      caption: z.string(),
      errors: z.array(importIssueSchema),
    }),
  ),
  valid: z.number(),
  invalid: z.number(),
  created: z.number(),
});
export type ImportResult = z.infer<typeof importResultSchema>;
