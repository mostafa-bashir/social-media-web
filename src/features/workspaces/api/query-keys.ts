export const workspaceKeys = {
  me: ["auth", "me"] as const,
  slugAvailability: (slug: string) =>
    ["workspaces", "slug-availability", slug] as const,
  /** Everything under a workspace is keyed by slug so switching never reuses cache. */
  scope: (slug: string) => ["workspace", slug] as const,
  details: (slug: string) => ["workspace", slug, "details"] as const,
  currentMember: (slug: string) =>
    ["workspace", slug, "current-member"] as const,
};
