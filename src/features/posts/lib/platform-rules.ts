import type { SocialPlatform } from "@/config/platforms";
import type { MediaAsset, MediaKind } from "@/lib/media";

import type { TargetFormat, TargetOptions } from "../types";

const SECOND_MS = 1_000;

export interface FormatRule {
  maxCaption: number;
  /** Stories show no caption: a warning, not an error. */
  captionUsed: boolean;
  minMedia: number;
  maxMedia: number;
  kinds: readonly MediaKind[];
  /** width / height bounds, checked when the file's size is known. */
  aspect?: { min: number; max: number };
  minVideoMs?: number;
  maxVideoMs?: number;
}

const IMAGE_OR_VIDEO = ["image", "video"] as const;
const VIDEO_ONLY = ["video"] as const;
const VERTICAL = { min: 0.5, max: 0.6 };
export const YOUTUBE_MAX_TITLE = 100;
export const INSTAGRAM_MAX_HASHTAGS = 30;
export const YOUTUBE_MAX_TAGS_LENGTH = 500;

/** How YouTube counts tags: commas between them, quotes around ones with spaces. */
export function youtubeTagsLength(tags: readonly string[]): number {
  const separators = Math.max(0, tags.length - 1);
  return tags.reduce(
    (total, tag) => total + tag.length + (tag.includes(" ") ? 2 : 0),
    separators,
  );
}
// A # followed by letters, digits or underscores, in any script.
const HASHTAG = /#[\p{L}\p{N}_]+/gu;

export function countHashtags(text: string): number {
  return text.match(HASHTAG)?.length ?? 0;
}
export const MAX_MEDIA = 10;

/** Mirrors the API's `platform-rules.ts` for instant feedback; the API decides. */
export const FORMAT_RULES: Record<
  SocialPlatform,
  Partial<Record<TargetFormat, FormatRule>>
> = {
  facebook: {
    feed: {
      maxCaption: 63_206,
      captionUsed: true,
      minMedia: 0,
      maxMedia: MAX_MEDIA,
      kinds: IMAGE_OR_VIDEO,
    },
    reel: {
      maxCaption: 63_206,
      captionUsed: true,
      minMedia: 1,
      maxMedia: 1,
      kinds: VIDEO_ONLY,
      aspect: VERTICAL,
      minVideoMs: 3 * SECOND_MS,
      maxVideoMs: 90 * SECOND_MS,
    },
    story: {
      maxCaption: 63_206,
      captionUsed: false,
      minMedia: 1,
      maxMedia: 1,
      kinds: IMAGE_OR_VIDEO,
      minVideoMs: 3 * SECOND_MS,
      maxVideoMs: 60 * SECOND_MS,
    },
  },
  instagram: {
    feed: {
      maxCaption: 2_200,
      captionUsed: true,
      minMedia: 1,
      maxMedia: MAX_MEDIA,
      kinds: IMAGE_OR_VIDEO,
      aspect: { min: 0.8, max: 1.91 },
      minVideoMs: 3 * SECOND_MS,
      maxVideoMs: 60 * SECOND_MS,
    },
    reel: {
      maxCaption: 2_200,
      captionUsed: true,
      minMedia: 1,
      maxMedia: 1,
      kinds: VIDEO_ONLY,
      minVideoMs: 3 * SECOND_MS,
      maxVideoMs: 15 * 60 * SECOND_MS,
    },
    story: {
      maxCaption: 2_200,
      captionUsed: false,
      minMedia: 1,
      maxMedia: 1,
      kinds: IMAGE_OR_VIDEO,
      minVideoMs: 3 * SECOND_MS,
      maxVideoMs: 60 * SECOND_MS,
    },
  },
  youtube: {
    video: {
      maxCaption: 5_000,
      captionUsed: true,
      minMedia: 1,
      maxMedia: 1,
      kinds: VIDEO_ONLY,
    },
    short: {
      maxCaption: 5_000,
      captionUsed: true,
      minMedia: 1,
      maxMedia: 1,
      kinds: VIDEO_ONLY,
      aspect: { min: 0, max: 1 },
      maxVideoMs: 180 * SECOND_MS,
    },
  },
};

export type PlatformIssue =
  | "FORMAT_NOT_SUPPORTED"
  | "CAPTION_TOO_LONG"
  | "CONTENT_REQUIRED"
  | "MEDIA_REQUIRED"
  | "TOO_FEW_MEDIA"
  | "TOO_MANY_MEDIA"
  | "MIXED_MEDIA"
  | "IMAGE_REQUIRED"
  | "JPEG_REQUIRED"
  | "TOO_MANY_HASHTAGS"
  | "VIDEO_REQUIRED"
  | "ASPECT_RATIO"
  | "VIDEO_TOO_SHORT"
  | "VIDEO_TOO_LONG"
  | "LINK_WITH_MEDIA"
  | "TITLE_REQUIRED"
  | "TITLE_TOO_LONG"
  | "TAGS_TOO_LONG";

/** Shown, but don't block publishing. */
export type PlatformWarning = "CAPTION_IGNORED" | "SIZE_UNKNOWN";

type RuleMedia = Pick<
  MediaAsset,
  "kind" | "mimeType" | "width" | "height" | "durationMs"
>;

export interface RuleInput {
  platform: SocialPlatform;
  format: TargetFormat;
  caption: string;
  media: RuleMedia[];
  options: TargetOptions;
}

const JPEG = "image/jpeg";

/** The caption limit shown in the counter; the same for every format of a platform. */
export function captionLimit(platform: SocialPlatform): number {
  return Math.max(
    ...Object.values(FORMAT_RULES[platform]).map((rule) => rule.maxCaption),
  );
}

/** The formats an account of `platform` can publish, in display order. */
export function platformFormats(platform: SocialPlatform): TargetFormat[] {
  return Object.keys(FORMAT_RULES[platform]) as TargetFormat[];
}

/** What the API picks when no format is sent; the composer starts from it too. */
export function defaultFormat(
  platform: SocialPlatform,
  media: Pick<MediaAsset, "kind">[],
): TargetFormat {
  if (platform === "youtube") return "video";
  if (platform === "instagram" && media.length === 1) {
    return media[0].kind === "video" ? "reel" : "feed";
  }
  return "feed";
}

/** Returns every problem at once so the user can fix them in one pass. */
export function checkPlatformRules(input: RuleInput): PlatformIssue[] {
  const rule = FORMAT_RULES[input.platform][input.format];
  if (!rule) return ["FORMAT_NOT_SUPPORTED"];
  return [
    ...(rule.captionUsed && input.caption.length > rule.maxCaption
      ? (["CAPTION_TOO_LONG"] as const)
      : []),
    ...checkMediaCount(input, rule),
    ...checkMediaFiles(input, rule),
    ...checkPlatformExtras(input),
  ];
}

export function platformWarnings(input: RuleInput): PlatformWarning[] {
  const rule = FORMAT_RULES[input.platform][input.format];
  if (!rule) return [];
  const warnings: PlatformWarning[] = [];
  if (!rule.captionUsed && input.caption.trim())
    warnings.push("CAPTION_IGNORED");
  const sized = rule.aspect || rule.minVideoMs || rule.maxVideoMs;
  if (sized && input.media.some((file) => file.width === null)) {
    warnings.push("SIZE_UNKNOWN");
  }
  return warnings;
}

function checkMediaCount(input: RuleInput, rule: FormatRule): PlatformIssue[] {
  const count = input.media.length;
  if (count > rule.maxMedia) return ["TOO_MANY_MEDIA"];
  if (count >= rule.minMedia) return [];
  if (count > 0) return ["TOO_FEW_MEDIA"];
  return [rule.kinds.includes("image") ? "MEDIA_REQUIRED" : "VIDEO_REQUIRED"];
}

function checkMediaFiles(input: RuleInput, rule: FormatRule): PlatformIssue[] {
  const issues = new Set<PlatformIssue>();
  for (const file of input.media) {
    if (!rule.kinds.includes(file.kind)) {
      issues.add("VIDEO_REQUIRED");
      continue;
    }
    if (rule.aspect && file.width && file.height) {
      const ratio = file.width / file.height;
      if (ratio < rule.aspect.min || ratio > rule.aspect.max) {
        issues.add("ASPECT_RATIO");
      }
    }
    if (file.kind === "video" && file.durationMs !== null) {
      if (rule.minVideoMs && file.durationMs < rule.minVideoMs) {
        issues.add("VIDEO_TOO_SHORT");
      }
      if (rule.maxVideoMs && file.durationMs > rule.maxVideoMs) {
        issues.add("VIDEO_TOO_LONG");
      }
    }
  }
  return [...issues];
}

function checkPlatformExtras(input: RuleInput): PlatformIssue[] {
  const { media, options } = input;
  const hasVideo = media.some((file) => file.kind === "video");
  const issues: PlatformIssue[] = [];
  if (input.platform === "facebook" && input.format === "feed") {
    if (!input.caption.trim() && media.length === 0 && !options.link) {
      issues.push("CONTENT_REQUIRED");
    }
    if (hasVideo && media.length > 1) issues.push("MIXED_MEDIA");
    if (options.link && media.length > 0) issues.push("LINK_WITH_MEDIA");
  }
  if (input.platform === "instagram") {
    if (input.format === "feed" && media.length === 1 && hasVideo) {
      issues.push("IMAGE_REQUIRED");
    }
    if (media.some((file) => file.kind === "image" && file.mimeType !== JPEG)) {
      issues.push("JPEG_REQUIRED");
    }
    if (countHashtags(input.caption) > INSTAGRAM_MAX_HASHTAGS) {
      issues.push("TOO_MANY_HASHTAGS");
    }
  }
  if (input.platform === "youtube") {
    const title = options.title?.trim() ?? "";
    if (!title) issues.push("TITLE_REQUIRED");
    else if (title.length > YOUTUBE_MAX_TITLE) issues.push("TITLE_TOO_LONG");
    if (youtubeTagsLength(options.tags ?? []) > YOUTUBE_MAX_TAGS_LENGTH) {
      issues.push("TAGS_TOO_LONG");
    }
  }
  return issues;
}
