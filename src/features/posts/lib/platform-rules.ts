import type { SocialPlatform } from "@/config/platforms";
import type { MediaAsset } from "@/lib/media";

import type { TargetOptions } from "../types";

/** Mirrors the API's `platform-rules.ts` for instant feedback; the API decides. */
export const PLATFORM_LIMITS: Record<
  SocialPlatform,
  { maxCaption: number; maxMedia: number; maxTitle?: number }
> = {
  facebook: { maxCaption: 63_206, maxMedia: 1 },
  instagram: { maxCaption: 2_200, maxMedia: 1 },
  youtube: { maxCaption: 5_000, maxMedia: 1, maxTitle: 100 },
};

export type PlatformIssue =
  | "CAPTION_TOO_LONG"
  | "CONTENT_REQUIRED"
  | "MEDIA_REQUIRED"
  | "TOO_MANY_MEDIA"
  | "JPEG_REQUIRED"
  | "VIDEO_REQUIRED"
  | "TITLE_REQUIRED"
  | "TITLE_TOO_LONG";

const JPEG = "image/jpeg";

export function checkPlatformRules(input: {
  platform: SocialPlatform;
  caption: string;
  media: Pick<MediaAsset, "kind" | "mimeType">[];
  options: TargetOptions;
}): PlatformIssue[] {
  const { platform, caption, media, options } = input;
  const limits = PLATFORM_LIMITS[platform];
  const issues: PlatformIssue[] = [];
  if (caption.length > limits.maxCaption) issues.push("CAPTION_TOO_LONG");
  if (media.length > limits.maxMedia) issues.push("TOO_MANY_MEDIA");

  if (platform === "facebook" && !caption.trim() && media.length === 0) {
    issues.push("CONTENT_REQUIRED");
  }
  if (platform === "instagram") {
    if (media.length === 0) issues.push("MEDIA_REQUIRED");
    else if (media[0].kind === "image" && media[0].mimeType !== JPEG) {
      issues.push("JPEG_REQUIRED");
    }
  }
  if (platform === "youtube") {
    if (media.length === 0 || media[0].kind !== "video") {
      issues.push("VIDEO_REQUIRED");
    }
    const title = options.title?.trim() ?? "";
    if (!title) issues.push("TITLE_REQUIRED");
    else if (title.length > (limits.maxTitle ?? Infinity)) {
      issues.push("TITLE_TOO_LONG");
    }
  }
  return issues;
}
