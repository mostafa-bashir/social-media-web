"use client";

import { useCallback } from "react";

import { useCurrentMember } from "../api/workspaces-api";
import type { PermissionSlug } from "../permissions";

/**
 * UI-only permission checks (hide/disable controls). The API enforces the
 * same permissions on every request regardless of what the UI shows.
 */
export function usePermissions() {
  const { data: member, isLoading } = useCurrentMember();
  const can = useCallback(
    (permission: PermissionSlug) =>
      member?.permissions.includes(permission) ?? false,
    [member],
  );
  return { can, isLoading, roleSlug: member?.roleSlug ?? null };
}
