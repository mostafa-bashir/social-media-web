/**
 * Locale-less app paths. Pass them to next-intl's `Link`/`useRouter`/`redirect`
 * (from `@/i18n/navigation`), which add the `/{locale}` prefix.
 */
export const routes = {
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
  "oauth-error",
]);
