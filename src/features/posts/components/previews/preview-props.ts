import type { SocialPlatform } from "@/config/platforms";
import type { MediaAsset } from "@/lib/media";

import type { TargetFormat } from "../../types";

/** Everything a preview shows; text is always rendered as plain text. */
export interface PreviewProps {
  platform: SocialPlatform;
  format: TargetFormat;
  accountName: string;
  avatarUrl: string | null;
  caption: string;
  media: MediaAsset[];
  altTexts: Record<string, string>;
  /** Facebook link posts. */
  link?: string;
  /** YouTube. */
  title?: string;
  /** Shown under feed posts, where it will appear. */
  firstComment?: string;
}
