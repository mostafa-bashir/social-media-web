import { z } from "zod";

import { TENANT_STATUSES } from "./tenants";

export const USER_STATE_FILTERS = ["disabled", "locked", "unverified"] as const;
export type UserStateFilter = (typeof USER_STATE_FILTERS)[number];

export const adminUserRowSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  verified: z.boolean(),
  disabled: z.boolean(),
  locked: z.boolean(),
  workspaceCount: z.number(),
  lastLoginAt: z.string().nullable(),
  createdAt: z.string(),
});
export type AdminUserRow = z.infer<typeof adminUserRowSchema>;

export const adminUserDetailSchema = adminUserRowSchema.extend({
  locale: z.string(),
  timezone: z.string(),
  lockedUntil: z.string().nullable(),
  disabledAt: z.string().nullable(),
  workspaces: z.array(
    z.object({
      tenantId: z.string(),
      slug: z.string(),
      name: z.string(),
      status: z.enum(TENANT_STATUSES),
      isOwner: z.boolean(),
    }),
  ),
});
export type AdminUserDetail = z.infer<typeof adminUserDetailSchema>;

export const USER_ACTIONS = [
  "sign-out",
  "unlock",
  "verify-email",
  "password-reset",
  "disable",
  "enable",
] as const;
export type UserAction = (typeof USER_ACTIONS)[number];
