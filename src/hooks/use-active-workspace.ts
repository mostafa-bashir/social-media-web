"use client";

import { useSession } from "next-auth/react";

/** Slug of the workspace the session is in — what the API scopes requests to. */
export function useActiveWorkspaceSlug(): string | null {
  return useSession().data?.activeWorkspace?.slug ?? null;
}
