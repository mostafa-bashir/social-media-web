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
  clients: (slug: string) => ["workspace", slug, "clients"] as const,
  socialAccounts: (slug: string) =>
    ["workspace", slug, "social-accounts"] as const,
  media: (slug: string) => ["workspace", slug, "media"] as const,
  posts: (slug: string) => ["workspace", slug, "posts"] as const,
  captionSnippets: (slug: string) =>
    ["workspace", slug, "caption-snippets"] as const,
  postingSlots: (slug: string) => ["workspace", slug, "posting-slots"] as const,
  analytics: (slug: string) => ["workspace", slug, "analytics"] as const,
  tasks: (slug: string) => ["workspace", slug, "tasks"] as const,
  taskStatuses: (slug: string) => ["workspace", slug, "task-statuses"] as const,
  taskLabels: (slug: string) => ["workspace", slug, "task-labels"] as const,
  taskSettings: (slug: string) => ["workspace", slug, "task-settings"] as const,
  sprints: (slug: string) => ["workspace", slug, "sprints"] as const,
  notifications: (slug: string) =>
    ["workspace", slug, "notifications"] as const,
  dashboard: (slug: string) => ["workspace", slug, "dashboard"] as const,
  taskAutomationRules: (slug: string) =>
    ["workspace", slug, "task-automation-rules"] as const,
  permissionCatalog: (slug: string) =>
    ["workspace", slug, "permission-catalog"] as const,
};
