import type { SocialPlatform } from "@/config/platforms";

import type { TargetFormat } from "../types";

export type FormatLabel = TargetFormat | "album" | "carousel";

/** A feed post with several files is an album on Facebook, a carousel on Instagram. */
export function formatLabel(
  platform: SocialPlatform,
  format: TargetFormat,
  mediaCount: number,
): FormatLabel {
  if (format !== "feed" || mediaCount < 2) return format;
  if (platform === "facebook") return "album";
  if (platform === "instagram") return "carousel";
  return format;
}
