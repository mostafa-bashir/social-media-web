/**
 * Shared React Query keys. Features never import each other, so data that two
 * features read (e.g. roles for the members role picker) shares its key here
 * and invalidations reach every consumer.
 *
 * Everything inside a workspace is keyed under `["workspace", slug]`, so
 * switching workspace never serves another workspace's cache.
 */
export const queryKeys = {
  me: ["auth", "me"] as const,
  slugAvailability: (slug: string) =>
    ["workspaces", "slug-availability", slug] as const,
  workspace: (slug: string) => ["workspace", slug] as const,
  workspaceDetails: (slug: string) => ["workspace", slug, "details"] as const,
  currentMember: (slug: string) =>
    ["workspace", slug, "current-member"] as const,
  members: (slug: string) => ["workspace", slug, "members"] as const,
  invitations: (slug: string) => ["workspace", slug, "invitations"] as const,
  roles: (slug: string) => ["workspace", slug, "roles"] as const,
  permissionCatalog: (slug: string) =>
    ["workspace", slug, "permission-catalog"] as const,
};
