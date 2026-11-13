"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { z } from "zod";

import type { FeatureKey } from "@/config/features";
import type { PermissionSlug } from "@/config/permissions";
import { apiClient, parseData } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

import { useActiveWorkspaceSlug } from "./use-active-workspace";

const currentMemberSchema = z.object({
  userId: z.string(),
  roleId: z.string(),
  roleSlug: z.string(),
  permissions: z.array(z.string()),
  /** Modules a platform admin switched off for this workspace. */
  disabledFeatures: z.array(z.string()),
});

/**
 * UI-only permission checks (hide/disable controls). The API enforces the
 * same permissions on every request regardless of what the UI shows.
 */
export function usePermissions() {
  const slug = useActiveWorkspaceSlug();
  const { data: member, isLoading } = useQuery({
    queryKey: queryKeys.currentMember(slug ?? ""),
    queryFn: async () =>
      parseData(currentMemberSchema, (await apiClient.get("/members/me")).data),
    enabled: Boolean(slug),
  });
  const can = useCallback(
    (permission: PermissionSlug) =>
      member?.permissions.includes(permission) ?? false,
    [member],
  );
  const featureEnabled = useCallback(
    (feature: FeatureKey) =>
      !(member?.disabledFeatures.includes(feature) ?? false),
    [member],
  );
  return {
    can,
    featureEnabled,
    isLoading,
    userId: member?.userId ?? null,
    roleSlug: member?.roleSlug ?? null,
  };
}
