import { z } from "zod";

import { ADMIN_ROLES } from "@/lib/admin-auth/admin-session-shared";

export {
  ADMIN_ROLES,
  type AdminRole,
} from "@/lib/admin-auth/admin-session-shared";

export const adminSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: z.enum(ADMIN_ROLES),
  isActive: z.boolean(),
  pendingSetup: z.boolean(),
  lastLoginAt: z.string().nullable(),
  createdAt: z.string(),
});
export type Admin = z.infer<typeof adminSchema>;

export const adminAuditEntrySchema = z.object({
  id: z.string(),
  adminId: z.string().nullable(),
  adminEmail: z.string().nullable(),
  adminName: z.string().nullable(),
  action: z.string(),
  targetType: z.string().nullable(),
  targetId: z.string().nullable(),
  tenantId: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  ipAddress: z.string().nullable(),
  createdAt: z.string(),
});
export type AdminAuditEntry = z.infer<typeof adminAuditEntrySchema>;
