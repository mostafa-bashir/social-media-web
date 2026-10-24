import { z } from "zod";

export const roleSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  isSystem: z.boolean(),
  permissions: z.array(z.string()),
  memberCount: z.number(),
});
export type Role = z.infer<typeof roleSchema>;

export const permissionInfoSchema = z.object({
  slug: z.string(),
  groupKey: z.string(),
  sortOrder: z.number(),
});
export type PermissionInfo = z.infer<typeof permissionInfoSchema>;

export interface RoleInput {
  name: string;
  description?: string;
  permissions: string[];
}
