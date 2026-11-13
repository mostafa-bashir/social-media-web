"use client";

import type { Session } from "next-auth";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import { type ReactNode, useEffect } from "react";

import { isPublicPath, matchesPrefix, routes } from "@/config/routes";
import { usePathname } from "@/i18n/navigation";
import { setApiSession } from "@/lib/api/api-session";
import type { SessionUpdate } from "@/lib/auth/session-types";

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
  const pathname = usePathname();
  // Guests may browse public pages (landing, share links, invites); a dead
  // session there is cleared quietly instead of bouncing them to the login form.
  // Same in the admin console, which has its own session and must not be left.
  const onPublicPage =
    isPublicPath(pathname) || matchesPrefix(pathname, [routes.admin.home]);

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
      // A support session that ran out returns its admin to the console.
      const signedOutUrl = session?.impersonation
        ? `/${locale}${routes.admin.home}`
        : `/${locale}${routes.auth.login}`;
      void (onPublicPage
        ? signOut({ redirect: false })
        : signOut({ callbackUrl: signedOutUrl }));
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
    // Any error marks the session dead, matching how pages and the proxy read it.
    if (session.error) {
      endSession();
      return;
    }

    // A support session is never refreshed: check once, when it ends.
    const refreshAt = session.impersonation
      ? session.impersonation.expiresAt
      : session.accessTokenExpiresAt - REFRESH_LEAD_MS;
    const delay = Math.max(refreshAt - Date.now(), MIN_TIMER_MS);
    const timer = window.setTimeout(() => void refresh(), delay);
    // Timers stall while a laptop sleeps; catch up when the tab is visible again.
    const onVisible = () => {
      if (document.visibilityState === "visible" && Date.now() >= refreshAt) {
        void refresh();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [session, update, locale, onPublicPage]);

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
