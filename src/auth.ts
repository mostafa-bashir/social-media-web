import NextAuth, { CredentialsSignin, type User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

import {
  BackendAuthError,
  type BackendAuthResponse,
  type BackendImpersonationResponse,
  endImpersonation,
  exchangeImpersonationCode,
  loginWithEmailCode,
  loginWithPassword,
  logout,
  refreshTokens,
  switchWorkspace,
} from "@/lib/auth/backend-auth";
import {
  SESSION_ERROR_REFRESH_FAILED,
  sessionUpdateSchema,
} from "@/lib/auth/session-types";

const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;
/** Refresh slightly early so a request never leaves with an expiring token. */
const ACCESS_TOKEN_EARLY_REFRESH_MS = 60_000;

/** Surfaces the API's error code to `signIn()` callers as `result.code`. */
class BackendSignInError extends CredentialsSignin {
  constructor(code: string) {
    super();
    this.code = code;
  }
}

const credentialsSchema = z.discriminatedUnion("method", [
  z.object({
    method: z.literal("password"),
    email: z.string(),
    password: z.string(),
  }),
  z.object({
    method: z.literal("email-code"),
    email: z.string(),
    code: z.string(),
  }),
  z.object({
    method: z.literal("impersonation"),
    code: z.string(),
  }),
]);

function toUser(response: BackendAuthResponse): User {
  return {
    sessionUser: response.user,
    accessToken: response.accessToken,
    accessTokenExpiresAt: response.accessTokenExpiresAt,
    refreshToken: response.refreshToken,
    activeWorkspace: response.activeWorkspace,
  };
}

function toImpersonationUser(response: BackendImpersonationResponse): User {
  return {
    sessionUser: response.user,
    accessToken: response.accessToken,
    accessTokenExpiresAt: response.accessTokenExpiresAt,
    refreshToken: "",
    activeWorkspace: response.activeWorkspace,
    impersonation: {
      id: response.impersonation.id,
      adminName: response.impersonation.adminName,
      expiresAt: new Date(response.impersonation.expiresAt).getTime(),
    },
  };
}

async function authorizeCredentials(
  credentials: z.infer<typeof credentialsSchema>,
  forwardedFor: string | null,
): Promise<User> {
  switch (credentials.method) {
    case "password":
      return toUser(
        await loginWithPassword(
          credentials.email,
          credentials.password,
          forwardedFor,
        ),
      );
    case "email-code":
      return toUser(
        await loginWithEmailCode(
          credentials.email,
          credentials.code,
          forwardedFor,
        ),
      );
    case "impersonation":
      return toImpersonationUser(
        await exchangeImpersonationCode(credentials.code, forwardedFor),
      );
  }
}

async function withFreshAccessToken(token: JWT): Promise<JWT> {
  // Support sessions have no refresh token: they simply end on time.
  if (token.impersonation) {
    return token.impersonation.expiresAt > Date.now()
      ? token
      : { ...token, error: SESSION_ERROR_REFRESH_FAILED };
  }
  if (token.accessTokenExpiresAt - ACCESS_TOKEN_EARLY_REFRESH_MS > Date.now()) {
    return token;
  }
  try {
    const refreshed = await refreshTokens(token.refreshToken);
    return { ...token, ...refreshed, error: undefined };
  } catch {
    return { ...token, error: SESSION_ERROR_REFRESH_FAILED };
  }
}

/**
 * Tokens are refreshed ONLY on explicit `update()` calls from the browser
 * (POST /api/auth/session), which always persist the new cookie. Server
 * Components can't write cookies, so refreshing there would leave the browser
 * holding a rotated-away refresh token — that is what forced the reference
 * project into its large refresh-race workarounds.
 */
async function applyUpdate(token: JWT, payload: unknown): Promise<JWT> {
  const update = sessionUpdateSchema.safeParse(payload);
  if (!update.success) {
    return token;
  }
  const fresh = await withFreshAccessToken(token);
  if (fresh.error || update.data.action === "refresh") {
    return fresh;
  }
  try {
    const switched = await switchWorkspace(fresh.accessToken, update.data.slug);
    return { ...fresh, ...switched };
  } catch (error) {
    // Not a member (any more): keep the session, leave the workspace unchanged.
    if (error instanceof BackendAuthError && error.status === 403) {
      return fresh;
    }
    throw error;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE_SECONDS },
  providers: [
    Credentials({
      id: "credentials",
      credentials: {
        method: {},
        email: {},
        password: {},
        code: {},
      },
      async authorize(raw, request) {
        const credentials = credentialsSchema.safeParse(raw);
        if (!credentials.success) {
          throw new BackendSignInError("VALIDATION_FAILED");
        }
        const forwardedFor = request.headers.get("x-forwarded-for");
        try {
          return await authorizeCredentials(credentials.data, forwardedFor);
        } catch (error) {
          throw new BackendSignInError(
            error instanceof BackendAuthError ? error.code : "UNKNOWN_ERROR",
          );
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        return {
          ...token,
          user: user.sessionUser,
          accessToken: user.accessToken,
          accessTokenExpiresAt: user.accessTokenExpiresAt,
          refreshToken: user.refreshToken,
          activeWorkspace: user.activeWorkspace,
          impersonation: user.impersonation,
        };
      }
      if (trigger === "update") {
        return applyUpdate(token, session);
      }
      return token;
    },
    session({ session, token }) {
      return {
        ...session,
        user: { ...session.user, ...token.user },
        accessToken: token.accessToken,
        accessTokenExpiresAt: token.accessTokenExpiresAt,
        activeWorkspace: token.activeWorkspace,
        impersonation: token.impersonation,
        error: token.error,
      };
    },
  },
  events: {
    async signOut(message) {
      if (!("token" in message) || !message.token) {
        return;
      }
      if (message.token.impersonation) {
        await endImpersonation(message.token.accessToken);
      } else if (message.token.refreshToken) {
        await logout(message.token.refreshToken);
      }
    },
  },
});
