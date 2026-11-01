import { z } from "zod";

/** Mirrors the API's `SocialPlatform` enum. */
export const SOCIAL_PLATFORMS = [
  "facebook",
  "instagram",
  "youtube",
  "tiktok",
] as const;
export const platformSchema = z.enum(SOCIAL_PLATFORMS);
export type SocialPlatform = z.infer<typeof platformSchema>;
