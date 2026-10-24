"use client";

import type { Session } from "next-auth";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import { type ReactNode, useEffect } from "react";

import { routes } from "@/config/routes";
import { setApiSession } from "@/lib/api/api-session";
import {
  SESSION_ERROR_REFRESH_FAILED,
  type SessionUpdate,
} from "@/lib/auth/session-types";

/** Refresh this long before the access token expires. */
const REFRESH_LEAD_MS = 2 * 60_000;
const MIN_TIMER_MS = 5_000;

/**
 * Keeps the API client's token in sync with the session and refreshes it
 * before expiry. Refreshing goes through `update()` (POST /api/auth/session),
 * the only path that reliably persists the rotated refresh token.
 */
function SessionSync() {
  const { data: session, update } = useSession();
  const locale = useLocale();

  useEffect(() => {
    const refresh = async () => {
      const next = await update({ action: "refresh" } satisfies SessionUpdate);
      return next
        ? {
            accessToken: next.accessToken,
            workspaceSlug: next.activeWorkspace?.slug ?? null,
          }
        : null;
    };
    const endSession = () => {
      void signOut({ callbackUrl: `/${locale}${routes.auth.login}` });
    };

    setApiSession(
      {
        accessToken: session?.accessToken ?? null,
        workspaceSlug: session?.activeWorkspace?.slug ?? null,
      },
      refresh,
      endSession,
    );

    if (!session) {
      return;
    }
    if (session.error === SESSION_ERROR_REFRESH_FAILED) {
      endSession();
      return;
    }

    const delay = Math.max(
      session.accessTokenExpiresAt - Date.now() - REFRESH_LEAD_MS,
      MIN_TIMER_MS,
    );
    const timer = window.setTimeout(() => void refresh(), delay);
    // Timers stall while a laptop sleeps; catch up when the tab is visible again.
    const onVisible = () => {
      if (
        document.visibilityState === "visible" &&
        session.accessTokenExpiresAt - Date.now() < REFRESH_LEAD_MS
      ) {
        void refresh();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [session, update, locale]);

  return null;
}

export function AuthSessionProvider({
  session,
  children,
}: {
  session: Session | null;
  children: ReactNode;
}) {
  return (
    <SessionProvider session={session} refetchOnWindowFocus={false}>
      <SessionSync />
      {children}
    </SessionProvider>
  );
}
