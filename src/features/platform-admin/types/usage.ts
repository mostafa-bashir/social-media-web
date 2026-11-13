import { z } from "zod";

export const USAGE_RANGES = [7, 30, 90] as const;
export type UsageRange = (typeof USAGE_RANGES)[number];

export const USAGE_SORTS = [
  "postsPublished",
  "activeUsers",
  "lastActiveDay",
  "name",
] as const;
export type UsageSort = (typeof USAGE_SORTS)[number];

const count = z.number();

export const usageOverviewSchema = z.object({
  days: z.number(),
  lastSnapshotAt: z.string().nullable(),
  kpis: z.object({
    tenantsActive: count,
    tenantsSuspended: count,
    newTenants: count,
    users: count,
    newUsers: count,
    dau: count,
    wau: count,
    mau: count,
    postsPublished: count,
    postsFailed: count,
  }),
  series: z.array(
    z.object({
      day: z.string(),
      newTenants: count,
      newUsers: count,
      activeUsers: count,
      postsPublished: count,
      postsFailed: count,
    }),
  ),
  publishedByPlatform: z.array(
    z.object({ platform: z.string(), posts: count }),
  ),
  featureAdoption: z.object({
    tenantsMeasured: count,
    features: z.array(z.object({ feature: z.string(), tenants: count })),
  }),
  topTenants: z.array(
    z.object({
      tenantId: z.string(),
      name: z.string(),
      slug: z.string(),
      postsPublished: count,
    }),
  ),
  atRiskTenants: z.array(
    z.object({
      tenantId: z.string(),
      name: z.string(),
      slug: z.string(),
      createdAt: z.string(),
      lastActiveDay: z.string().nullable(),
    }),
  ),
});
export type UsageOverview = z.infer<typeof usageOverviewSchema>;

export const tenantUsageRowSchema = z.object({
  tenantId: z.string(),
  name: z.string(),
  slug: z.string(),
  status: z.string(),
  members: z.number().nullable(),
  socialAccounts: z.number().nullable(),
  postsPublished: count,
  postsFailed: count,
  tasksCompleted: count,
  activeUsers: count,
  lastActiveDay: z.string().nullable(),
  featuresUsed: z.number().nullable(),
});
export type TenantUsageRow = z.infer<typeof tenantUsageRowSchema>;

export const tenantUsageSeriesSchema = z.object({
  days: z.number(),
  series: z.array(
    z.object({
      day: z.string(),
      postsCreated: count,
      postsPublished: count,
      postsFailed: count,
      tasksCreated: count,
      tasksCompleted: count,
      activeUsers: count,
    }),
  ),
  features: z.record(z.string(), z.boolean()).nullable(),
});
export type TenantUsageSeries = z.infer<typeof tenantUsageSeriesSchema>;
