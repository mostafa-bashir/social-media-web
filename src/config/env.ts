import { z } from "zod";

/** Browser-safe values. Inlined at build time, so read each var explicitly. */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.url(),
});

export const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});

const serverEnvSchema = z.object({
  API_URL: z.url(),
  AUTH_SECRET: z.string().min(16),
});

/** Server-only values. Call lazily so client bundles never evaluate it. */
export function getServerEnv(): z.infer<typeof serverEnvSchema> {
  return serverEnvSchema.parse({
    API_URL: process.env.API_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
  });
}

/** Local fallback only; production must name its public origin. */
const DEV_SITE_URL = "http://localhost:3000";

const siteOriginSchema = z
  .url({ protocol: /^https?$/, error: "SITE_URL must be an http(s) URL" })
  .refine((value) => {
    const { pathname, search, hash } = new URL(value);
    return pathname === "/" && !search && !hash;
  }, "SITE_URL must be an origin only, e.g. https://example.com")
  .transform((value) => new URL(value).origin);

function readSiteUrl() {
  const raw = process.env.SITE_URL;
  if (raw) {
    return siteOriginSchema.safeParse(raw);
  }
  return process.env.NODE_ENV === "production"
    ? siteOriginSchema.safeParse(undefined)
    : ({ success: true, data: DEV_SITE_URL } as const);
}

/**
 * Public origin for canonical/OG URLs, or null when unset or invalid in
 * production. Page metadata uses this so a missing SEO setting never breaks
 * the app itself; those pages just omit absolute URLs.
 */
export function findSiteUrl(): string | null {
  const result = readSiteUrl();
  return result.success ? result.data : null;
}

/** Public origin for the sitemap and robots.txt; throws a clear error when unset or invalid. */
export function getSiteUrl(): string {
  const result = readSiteUrl();
  if (!result.success) {
    throw result.error;
  }
  return result.data;
}
