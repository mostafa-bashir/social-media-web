import NextAuth, { CredentialsSignin, type User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

import {
  BackendAuthError,
  type BackendAuthResponse,
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

async function withFreshAccessToken(token: JWT): Promise<JWT> {
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
          const response =
            credentials.data.method === "password"
              ? await loginWithPassword(
                  credentials.data.email,
                  credentials.data.password,
                  forwardedFor,
                )
              : await loginWithEmailCode(
                  credentials.data.email,
                  credentials.data.code,
                  forwardedFor,
                );
          return toUser(response);
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
        error: token.error,
      };
    },
  },
  events: {
    async signOut(message) {
      if ("token" in message && message.token?.refreshToken) {
        await logout(message.token.refreshToken);
      }
    },
  },
});
