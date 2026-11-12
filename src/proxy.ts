import { getToken } from "next-auth/jwt";
import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";

import {
  matchesPrefix,
  METADATA_IMAGE_PATHS,
  NON_WORKSPACE_SEGMENTS,
  PUBLIC_PREFIXES,
  routes,
} from "@/config/routes";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

/** Auth pages a signed-in user should skip. */
const GUEST_ONLY_PREFIXES = ["/auth"];

function splitLocale(
  pathname: string,
): { locale: string; path: string } | null {
  const [, first, ...rest] = pathname.split("/");
  if (!routing.locales.includes(first as (typeof routing.locales)[number])) {
    return null;
  }
  return { locale: first, path: `/${rest.join("/")}` };
}

/**
 * Coarse routing gate only — the API enforces real authorization on every
 * request. Runs before every page: locale prefixing, sign-in redirects, and
 * keeping the URL's workspace in line with the session's active workspace.
 */
export default async function proxy(request: NextRequest) {
  const localized = splitLocale(request.nextUrl.pathname);
  if (!localized) {
    return intlMiddleware(request);
  }
  const { locale, path } = localized;
  if (METADATA_IMAGE_PATHS.has(path)) {
    return NextResponse.next();
  }
  const redirectTo = (target: string) =>
    NextResponse.redirect(new URL(`/${locale}${target}`, request.url));

  // Auth.js salts the cookie encryption with the cookie name, which differs on HTTPS.
  const secureCookie =
    request.nextUrl.protocol === "https:" ||
    request.headers.get("x-forwarded-proto") === "https";
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie,
  });
  const signedIn = Boolean(token) && !token?.error;

  if (matchesPrefix(path, PUBLIC_PREFIXES)) {
    if (signedIn && matchesPrefix(path, GUEST_ONLY_PREFIXES)) {
      return redirectTo(routes.workspaces.picker);
    }
    return intlMiddleware(request);
  }

  // Guests on the bare locale root get the public landing page; signed-in
  // users fall through to the page, which redirects into their workspace.
  if (path === "/") {
    return intlMiddleware(request);
  }

  if (!signedIn) {
    const login = new URL(`/${locale}${routes.auth.login}`, request.url);
    login.searchParams.set(
      "callbackUrl",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(login);
  }

  const [, firstSegment] = path.split("/");
  const isWorkspacePath =
    Boolean(firstSegment) && !NON_WORKSPACE_SEGMENTS.has(firstSegment);
  if (isWorkspacePath && token?.activeWorkspace?.slug !== firstSegment) {
    // Deep link into another workspace: let the picker switch (or refuse) first.
    const picker = new URL(
      `/${locale}${routes.workspaces.picker}`,
      request.url,
    );
    picker.searchParams.set("switchTo", firstSegment);
    // Keep the query (filters, `?post=`…); the picker only follows `next`
    // inside the workspace it switched to (see `useSwitchWorkspace`).
    picker.searchParams.set("next", `${path}${request.nextUrl.search}`);
    return NextResponse.redirect(picker);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
