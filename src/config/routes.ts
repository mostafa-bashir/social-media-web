/**
 * Locale-less app paths. Pass them to next-intl's `Link`/`useRouter`/`redirect`
 * (from `@/i18n/navigation`), which add the `/{locale}` prefix.
 */
export const routes = {
  /** Public landing page for guests; signed-in users are sent to their workspace. */
  home: "/",
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    verifyEmail: "/auth/verify-email",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
  },
  workspaces: {
    picker: "/workspaces",
    create: "/workspaces/new",
  },
  invite: (token: string) => `/invite/${encodeURIComponent(token)}`,
  /** A client report shared by link, readable without signing in. */
  sharedReport: (token: string) => `/r/${encodeURIComponent(token)}`,
  /** Where the admin console hands a support session to the app. */
  impersonate: "/impersonate",
  /** A link a client or prospect opens to connect their own accounts. */
  connectLink: (token: string) => `/connect/${encodeURIComponent(token)}`,
  /** Platform admin console: separate sign-in, never inside a workspace. */
  admin: {
    home: "/admin",
    login: "/admin/login",
    setupPassword: "/admin/setup-password",
    admins: "/admin/admins",
    auditLog: "/admin/audit-log",
    tenants: "/admin/tenants",
    tenant: (tenantId: string) => `/admin/tenants/${tenantId}`,
    users: "/admin/users",
    usage: "/admin/usage",
    health: "/admin/health",
    announcements: "/admin/announcements",
    user: (userId: string) => `/admin/users/${userId}`,
  },
  workspace: (slug: string) => ({
    home: `/${slug}/dashboard`,
    members: `/${slug}/members`,
    clients: `/${slug}/clients`,
    accounts: `/${slug}/accounts`,
    posts: `/${slug}/posts`,
    newPost: `/${slug}/posts/new`,
    post: (postId: string) => `/${slug}/posts/${postId}`,
    media: `/${slug}/media`,
    tasks: `/${slug}/tasks`,
    analytics: `/${slug}/analytics`,
    analyticsAccounts: `/${slug}/analytics/accounts`,
    analyticsAccount: (accountId: string) =>
      `/${slug}/analytics/accounts/${accountId}`,
    analyticsPosts: `/${slug}/analytics/posts`,
    analyticsContent: `/${slug}/analytics/content`,
    analyticsAudience: `/${slug}/analytics/audience`,
    analyticsReports: `/${slug}/analytics/reports`,
    roles: `/${slug}/roles`,
    settings: `/${slug}/settings`,
  }),
} as const;

/** First path segments that are app routes, never workspace slugs. */
export const NON_WORKSPACE_SEGMENTS: ReadonlySet<string> = new Set([
  "auth",
  "workspaces",
  "invite",
  "r",
  "connect",
  "oauth-error",
  "admin",
  "impersonate",
]);

/** Admin console pages reachable without an admin session. */
export const ADMIN_PUBLIC_PATHS: readonly string[] = [
  routes.admin.login,
  routes.admin.setupPassword,
];

/** Locale-less path prefixes reachable without a session (besides `routes.home`). */
export const PUBLIC_PREFIXES: readonly string[] = [
  "/auth",
  "/impersonate",
  "/invite",
  "/r",
  "/connect",
];

/** Generated link-preview images under `/{locale}`; crawlers fetch them signed out. */
export const METADATA_IMAGE_PATHS: ReadonlySet<string> = new Set([
  "/opengraph-image",
  "/twitter-image",
]);

export function matchesPrefix(
  path: string,
  prefixes: readonly string[],
): boolean {
  return prefixes.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

/** Pages a guest may view; a dead session there is cleared, not sent to login. */
export function isPublicPath(path: string): boolean {
  return path === routes.home || matchesPrefix(path, PUBLIC_PREFIXES);
}
