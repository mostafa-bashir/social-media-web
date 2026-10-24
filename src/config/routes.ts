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
  workspace: (slug: string) => ({
    home: `/${slug}/dashboard`,
    members: `/${slug}/members`,
    roles: `/${slug}/roles`,
    settings: `/${slug}/settings`,
  }),
} as const;

/** First path segments that are app routes, never workspace slugs. */
export const NON_WORKSPACE_SEGMENTS: ReadonlySet<string> = new Set([
  "auth",
  "workspaces",
  "invite",
]);
