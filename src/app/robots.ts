import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/config/env";
import { METADATA_IMAGE_PATHS } from "@/config/routes";
import { routing } from "@/i18n/routing";

// Read SITE_URL per request so builds don't need runtime env or freeze its value.
export const dynamic = "force-dynamic";

/** Assets crawlers need to render the landing page. */
const RENDER_ASSET_PATHS = ["/_next/static/", "/_next/image", "/icon.svg"];

/**
 * Only the public landing pages (with or without a query string) and their
 * assets are crawlable; everything else sits behind sign-in.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [
        ...routing.locales.flatMap((locale) => [
          `/${locale}$`,
          `/${locale}?`,
          ...[...METADATA_IMAGE_PATHS].map((path) => `/${locale}${path}`),
        ]),
        ...RENDER_ASSET_PATHS,
      ],
      disallow: "/",
    },
    sitemap: new URL("/sitemap.xml", getSiteUrl()).toString(),
  };
}
