import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";

/** Add a namespace here and create `src/locales/{en,ar}/<name>.json`. */
const NAMESPACES = [
  "common",
  "auth",
  "workspaces",
  "members",
  "roles",
  "settings",
  "errors",
  "dashboard",
  "validation",
  "clients",
  "accounts",
  "media",
  "posts",
  "analytics",
  "tasks",
  "notifications",
] as const;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const modules = await Promise.all(
    NAMESPACES.map(
      (namespace) =>
        import(`../locales/${locale}/${namespace}.json`) as Promise<{
          default: Record<string, unknown>;
        }>,
    ),
  );
  const messages = Object.fromEntries(
    NAMESPACES.map((namespace, index) => [namespace, modules[index].default]),
  );

  return { locale, messages };
});
