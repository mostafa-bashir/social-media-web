"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";

const SYSTEM_ROLE_SLUGS = new Set(["owner", "admin", "member"]);

/** Built-in roles are translated; custom roles show the name the team chose. */
export function useRoleLabel(): (role: {
  slug: string;
  name: string;
}) => string {
  const t = useTranslations("roles.system");
  return useCallback(
    (role) =>
      SYSTEM_ROLE_SLUGS.has(role.slug) ? t(`${role.slug}.name`) : role.name,
    [t],
  );
}
