import { defineRouting } from "next-intl/routing";

export const LOCALES = ["en", "ar"] as const;
export type AppLocale = (typeof LOCALES)[number];

export const RTL_LOCALES: ReadonlySet<string> = new Set(["ar"]);

export function directionFor(locale: string): "rtl" | "ltr" {
  return RTL_LOCALES.has(locale) ? "rtl" : "ltr";
}

/**
 * The locale is always in the URL (`/en/...`, `/ar/...`) so the first segment
 * after it is unambiguous: an app route or a workspace slug.
 */
export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: "en",
  localePrefix: "always",
});
