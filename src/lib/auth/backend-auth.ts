import "server-only";

import { z } from "zod";

import { getServerEnv } from "@/config/env";

import { sessionUserSchema, workspaceSummarySchema } from "./session-types";

const tokensSchema = z.object({
  accessToken: z.string(),
  accessTokenExpiresAt: z.number(),
  refreshToken: z.string(),
});

const authResponseSchema = tokensSchema.extend({
  user: sessionUserSchema,
  activeWorkspace: workspaceSummarySchema.nullable(),
});
export type BackendAuthResponse = z.infer<typeof authResponseSchema>;

const impersonationResponseSchema = z.object({
  accessToken: z.string(),
  accessTokenExpiresAt: z.number(),
  user: sessionUserSchema,
  activeWorkspace: workspaceSummarySchema,
  impersonation: z.object({
    id: z.string(),
    adminName: z.string(),
    expiresAt: z.string(),
  }),
});
export type BackendImpersonationResponse = z.infer<
  typeof impersonationResponseSchema
>;

const switchResponseSchema = z.object({
  accessToken: z.string(),
  accessTokenExpiresAt: z.number(),
  activeWorkspace: workspaceSummarySchema.nullable(),
});

const errorSchema = z.object({
  error: z.object({ code: z.string(), message: z.string() }),
});

/** A backend rejection carrying the API's stable error `code`. */
export class BackendAuthError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
  ) {
    super(code);
  }
}

export async function post<T>(
  path: string,
  body: unknown,
  schema: z.ZodType<T>,
  init: { accessToken?: string; forwardedFor?: string | null } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (init.accessToken) headers.Authorization = `Bearer ${init.accessToken}`;
  // The API trusts this only from configured proxies (TRUSTED_PROXY_CIDRS).
  if (init.forwardedFor) headers["X-Forwarded-For"] = init.forwardedFor;

  const response = await fetch(`${getServerEnv().API_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const json: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const parsed = errorSchema.safeParse(json);
    throw new BackendAuthError(
      parsed.success ? parsed.data.error.code : "UNKNOWN_ERROR",
      response.status,
    );
  }
  return z.object({ data: schema }).parse(json).data;
}

export function loginWithPassword(
  email: string,
  password: string,
  forwardedFor: string | null,
): Promise<BackendAuthResponse> {
  return post("/auth/login", { email, password }, authResponseSchema, {
    forwardedFor,
  });
}

export function loginWithEmailCode(
  email: string,
  code: string,
  forwardedFor: string | null,
): Promise<BackendAuthResponse> {
  return post("/auth/verify-email", { email, code }, authResponseSchema, {
    forwardedFor,
  });
}

/** Turns the admin console's one-time code into a support session. */
export function exchangeImpersonationCode(
  code: string,
  forwardedFor: string | null,
): Promise<BackendImpersonationResponse> {
  return post(
    "/auth/impersonation/exchange",
    { code },
    impersonationResponseSchema,
    { forwardedFor },
  );
}

/** Best effort, like `logout`: the local session is cleared regardless. */
export async function endImpersonation(accessToken: string): Promise<void> {
  await fetch(`${getServerEnv().API_URL}/auth/impersonation/end`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  }).catch(() => undefined);
}

export function refreshTokens(
  refreshToken: string,
): Promise<z.infer<typeof tokensSchema>> {
  return post("/auth/refresh", { refreshToken }, tokensSchema);
}

export function switchWorkspace(
  accessToken: string,
  slug: string | null,
): Promise<z.infer<typeof switchResponseSchema>> {
  return post(
    "/auth/switch-workspace",
    { tenantSlug: slug },
    switchResponseSchema,
    { accessToken },
  );
}

/** Best effort: the local session is cleared even if the API is unreachable. */
export async function logout(refreshToken: string): Promise<void> {
  await fetch(`${getServerEnv().API_URL}/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  }).catch(() => undefined);
}
