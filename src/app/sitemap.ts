import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/config/env";
import { routing } from "@/i18n/routing";

// Read SITE_URL per request so builds don't need runtime env or freeze its value.
export const dynamic = "force-dynamic";

/** One entry per locale landing page, each listing its language alternates. */
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const localeUrl = (locale: string) =>
    new URL(`/${locale}`, siteUrl).toString();
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [locale, localeUrl(locale)]),
  );
  return routing.locales.map((locale) => ({
    url: localeUrl(locale),
    changeFrequency: "monthly",
    priority: 1,
    alternates: { languages },
  }));
}
