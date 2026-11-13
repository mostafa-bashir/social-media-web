import "server-only";

import { decode, encode } from "next-auth/jwt";
import { z } from "zod";

import { getServerEnv } from "@/config/env";
import { BackendAuthError, post } from "@/lib/auth/backend-auth";

import {
  ADMIN_REFRESH_LEAD_MS,
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  adminProfileSchema,
} from "./admin-session-shared";

/**
 * Wider than the browser's refresh lead, so the browser's scheduled refresh
 * always gets a new token (and a new expiry to schedule the next one from).
 */
const ACCESS_TOKEN_EARLY_REFRESH_MS = ADMIN_REFRESH_LEAD_MS + 30_000;

const adminTokensSchema = z.object({
  accessToken: z.string(),
  accessTokenExpiresAt: z.number(),
  refreshToken: z.string(),
});

const adminCookieSchema = adminTokensSchema.extend({
  admin: adminProfileSchema,
});
export type AdminCookie = z.infer<typeof adminCookieSchema>;

const verifyResponseSchema = adminTokensSchema.extend({
  admin: adminProfileSchema,
});

/**
 * The admin session is its own encrypted cookie (Auth.js's JWE helpers,
 * salted with a different cookie name), never mixed with the agency session.
 * The refresh token stays server-side; the browser only gets the access token.
 */
export async function sealAdminCookie(value: AdminCookie): Promise<string> {
  return encode({
    token: value,
    secret: getServerEnv().AUTH_SECRET,
    salt: ADMIN_SESSION_COOKIE,
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });
}

export async function openAdminCookie(
  raw: string | undefined,
): Promise<AdminCookie | null> {
  if (!raw) {
    return null;
  }
  try {
    const payload = await decode({
      token: raw,
      secret: getServerEnv().AUTH_SECRET,
      salt: ADMIN_SESSION_COOKIE,
    });
    const parsed = adminCookieSchema.safeParse(payload);
    return parsed.success ? parsed.data : null;
  } catch {
    // Tampered, expired, or sealed with a rotated secret: treat as signed out.
    return null;
  }
}

export function verifyAdminLogin(
  challengeToken: string,
  code: string,
  forwardedFor: string | null,
): Promise<AdminCookie> {
  return post(
    "/admin/auth/verify",
    { challengeToken, code },
    verifyResponseSchema,
    { forwardedFor },
  );
}

/** Returns the session with a usable access token, or null when it can't be renewed. */
export async function ensureFreshAdminSession(
  session: AdminCookie,
  forwardedFor: string | null,
): Promise<{ session: AdminCookie; refreshed: boolean } | null> {
  if (
    session.accessTokenExpiresAt - ACCESS_TOKEN_EARLY_REFRESH_MS >
    Date.now()
  ) {
    return { session, refreshed: false };
  }
  try {
    const tokens = await post(
      "/admin/auth/refresh",
      { refreshToken: session.refreshToken },
      adminTokensSchema,
      { forwardedFor },
    );
    return { session: { ...session, ...tokens }, refreshed: true };
  } catch (error) {
    if (error instanceof BackendAuthError && error.status < 500) {
      return null;
    }
    throw error;
  }
}

/**
 * Revokes the API session. Throws when the API refuses or is unreachable, so
 * the caller keeps the cookie and the admin can retry: clearing it anyway
 * would show "signed out" while the refresh token stays valid server-side.
 * The client IP is forwarded so an `ADMIN_ALLOWED_IPS` allowlist still matches.
 */
export async function revokeAdminSession(
  refreshToken: string,
  forwardedFor: string | null,
): Promise<void> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (forwardedFor) headers["X-Forwarded-For"] = forwardedFor;
  const response = await fetch(`${getServerEnv().API_URL}/admin/auth/logout`, {
    method: "POST",
    headers,
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new BackendAuthError("ADMIN_LOGOUT_FAILED", response.status);
  }
}
