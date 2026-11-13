import { z } from "zod";

import { platformSchema } from "@/config/platforms";

export const TENANT_STATUSES = ["active", "suspended"] as const;
export type TenantStatus = (typeof TENANT_STATUSES)[number];

export const adminTenantRowSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  status: z.enum(TENANT_STATUSES),
  createdAt: z.string(),
  ownerId: z.string().nullable(),
  ownerEmail: z.string().nullable(),
  ownerName: z.string().nullable(),
  memberCount: z.number(),
});
export type AdminTenantRow = z.infer<typeof adminTenantRowSchema>;

export const adminTenantDetailSchema = adminTenantRowSchema.extend({
  timezone: z.string(),
  locale: z.string(),
  counts: z.object({
    clients: z.number(),
    socialAccounts: z.number(),
    socialAccountsNeedingReconnect: z.number(),
    posts: z.number(),
    postsScheduled: z.number(),
    postsFailed: z.number(),
    tasks: z.number(),
    mediaBytes: z.number(),
  }),
});
export type AdminTenantDetail = z.infer<typeof adminTenantDetailSchema>;

export const adminTenantMemberSchema = z.object({
  userId: z.string(),
  name: z.string(),
  email: z.string(),
  roleName: z.string(),
  roleSlug: z.string(),
  isOwner: z.boolean(),
  joinedAt: z.string(),
  lastLoginAt: z.string().nullable(),
  disabled: z.boolean(),
});
export type AdminTenantMember = z.infer<typeof adminTenantMemberSchema>;

export const adminTenantAccountSchema = z.object({
  id: z.string(),
  platform: platformSchema,
  displayName: z.string(),
  username: z.string().nullable(),
  clientName: z.string(),
  status: z.string(),
  tokenExpiresAt: z.string().nullable(),
  lastError: z.string().nullable(),
  createdAt: z.string(),
});
export type AdminTenantAccount = z.infer<typeof adminTenantAccountSchema>;

export const adminTenantActivitySchema = z.object({
  id: z.string(),
  action: z.string(),
  resourceType: z.string(),
  resourceId: z.string().nullable(),
  actorEmail: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  createdAt: z.string(),
});
export type AdminTenantActivity = z.infer<typeof adminTenantActivitySchema>;

export const IMPERSONATION_STATES = [
  "pending",
  "active",
  "ended",
  "expired",
] as const;

export const adminImpersonationSchema = z.object({
  id: z.string(),
  adminName: z.string().nullable(),
  tenantId: z.string(),
  tenantSlug: z.string(),
  userEmail: z.string(),
  reason: z.string(),
  state: z.enum(IMPERSONATION_STATES),
  createdAt: z.string(),
  expiresAt: z.string(),
  endedAt: z.string().nullable(),
  endedBy: z.string().nullable(),
});
export type AdminImpersonation = z.infer<typeof adminImpersonationSchema>;
