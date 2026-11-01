import { z } from "zod";

import { platformSchema, type SocialPlatform } from "@/config/platforms";

export {
  SOCIAL_PLATFORMS,
  platformSchema,
  type SocialPlatform,
} from "@/config/platforms";

export const ACCOUNT_STATUSES = ["active", "reconnect_required"] as const;
export const accountStatusSchema = z.enum(ACCOUNT_STATUSES);
export type AccountStatus = z.infer<typeof accountStatusSchema>;

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
  /** False when connected before analytics permissions were asked for. */
  analyticsEnabled: z.boolean(),
  /** False when connected before comment permissions were asked for. */
  engagementEnabled: z.boolean(),
  analyticsSyncedAt: z.string().nullable(),
  analyticsError: z.string().nullable(),
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

export interface SocialAccountsQuery {
  page: number;
  pageSize: number;
  clientId?: string;
  platform?: SocialPlatform;
  status?: AccountStatus;
}

/** Reasons the API's OAuth callback sends back in `?connectError=`. */
export const CONNECT_ERROR_CODES = [
  "ACCESS_DENIED",
  "STATE_INVALID",
  "NO_ACCOUNTS",
  "PLATFORM_ERROR",
] as const;
export type ConnectErrorCode = (typeof CONNECT_ERROR_CODES)[number];
