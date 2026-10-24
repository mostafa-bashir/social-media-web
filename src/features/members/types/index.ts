import { z } from "zod";

export const memberSchema = z.object({
  userId: z.string(),
  name: z.string(),
  email: z.string(),
  avatarUrl: z.string().nullable(),
  role: z.object({ id: z.string(), name: z.string(), slug: z.string() }),
  jobTitle: z.string().nullable(),
  isOwner: z.boolean(),
  joinedAt: z.string(),
});
export type Member = z.infer<typeof memberSchema>;

export const invitationSchema = z.object({
  id: z.string(),
  email: z.string(),
  roleId: z.string(),
  invitedBy: z.string().nullable(),
  expiresAt: z.string(),
  createdAt: z.string(),
});
export type Invitation = z.infer<typeof invitationSchema>;

export const roleOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});
export type RoleOption = z.infer<typeof roleOptionSchema>;

export interface MembersQuery {
  page: number;
  pageSize: number;
  search?: string;
}
