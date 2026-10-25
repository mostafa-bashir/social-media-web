import { z } from "zod";

/** Mirrors the API's `SocialPlatform` enum. */
export const SOCIAL_PLATFORMS = ["facebook", "instagram", "youtube"] as const;
export const platformSchema = z.enum(SOCIAL_PLATFORMS);
export type SocialPlatform = z.infer<typeof platformSchema>;

export const accountStatusSchema = z.enum(["active", "reconnect_required"]);

export const socialAccountSchema = z.object({
  id: z.string(),
  client: z.object({ id: z.string(), name: z.string() }),
  platform: platformSchema,
  accountType: z.string(),
  externalId: z.string(),
  displayName: z.string(),
  username: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  status: accountStatusSchema,
  lastError: z.string().nullable(),
  tokenExpiresAt: z.string().nullable(),
  lastRefreshedAt: z.string().nullable(),
  createdAt: z.string(),
});
export type SocialAccount = z.infer<typeof socialAccountSchema>;

export const platformAvailabilitySchema = z.object({
  platform: platformSchema,
  configured: z.boolean(),
});
export type PlatformAvailability = z.infer<typeof platformAvailabilitySchema>;

export const selectionSchema = z.object({
  platform: platformSchema,
  client: z.object({ id: z.string(), name: z.string() }),
  accounts: z.array(
    z.object({
      externalId: z.string(),
      accountType: z.string(),
      displayName: z.string(),
      username: z.string().nullable(),
      avatarUrl: z.string().nullable(),
      alreadyConnected: z.boolean(),
      connectedToOtherClient: z.boolean(),
    }),
  ),
});
export type ConnectSelection = z.infer<typeof selectionSchema>;

export const clientOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type ClientOption = z.infer<typeof clientOptionSchema>;

export interface SocialAccountsQuery {
  page: number;
  pageSize: number;
  clientId?: string;
  platform?: SocialPlatform;
}

/** Reasons the API's OAuth callback sends back in `?connectError=`. */
export const CONNECT_ERROR_CODES = [
  "ACCESS_DENIED",
  "STATE_INVALID",
  "NO_ACCOUNTS",
  "PLATFORM_ERROR",
] as const;
export type ConnectErrorCode = (typeof CONNECT_ERROR_CODES)[number];
