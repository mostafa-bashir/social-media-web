import { z } from "zod";

/** Separate from the Auth.js cookie; also the JWE salt, so the two can't be swapped. */
export const ADMIN_SESSION_COOKIE = "sm-admin-session";

/** Matches the API's default ADMIN_SESSION_TTL_HOURS; the API enforces the real limit. */
export const ADMIN_SESSION_MAX_AGE_SECONDS = 12 * 60 * 60;

/** The console refreshes its access token this long before it expires. */
export const ADMIN_REFRESH_LEAD_MS = 2 * 60_000;

export const ADMIN_ROLES = ["super_admin", "support"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const adminProfileSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: z.enum(ADMIN_ROLES),
});
export type AdminProfile = z.infer<typeof adminProfileSchema>;

/** What `GET /api/admin-session` returns to the browser (no refresh token). */
export const adminBrowserSessionSchema = z.object({
  accessToken: z.string(),
  accessTokenExpiresAt: z.number(),
  admin: adminProfileSchema,
});
export type AdminBrowserSession = z.infer<typeof adminBrowserSessionSchema>;
