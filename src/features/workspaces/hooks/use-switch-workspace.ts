"use client";

import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import { useCallback, useState } from "react";

import { routes } from "@/config/routes";
import type { SessionUpdate } from "@/lib/auth/session-types";

/**
 * Activates a workspace on the session (the API re-checks membership) and
 * navigates into it. Resolves `false` when the user isn't a member.
 */
export function useSwitchWorkspace() {
  const { update } = useSession();
  const locale = useLocale();
  const [switchingTo, setSwitchingTo] = useState<string | null>(null);

  const switchTo = useCallback(
    async (slug: string, nextPath?: string): Promise<boolean> => {
      setSwitchingTo(slug);
      const session = await update({
        action: "switch-workspace",
        slug,
      } satisfies SessionUpdate);
      if (session?.activeWorkspace?.slug !== slug) {
        setSwitchingTo(null);
        return false;
      }
      const target =
        nextPath?.startsWith(`/${slug}/`) === true
          ? nextPath
          : routes.workspace(slug).home;
      // Full navigation: server components and caches start clean in the new workspace.
      window.location.assign(`/${locale}${target}`);
      return true;
    },
    [locale, update],
  );

  return { switchTo, switchingTo };
}
