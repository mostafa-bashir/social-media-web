import { z } from "zod";

export const sessionUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
  locale: z.string(),
});
export type SessionUser = z.infer<typeof sessionUserSchema>;

export const workspaceSummarySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  logoUrl: z.string().nullable(),
  isOwner: z.boolean(),
});
export type WorkspaceSummary = z.infer<typeof workspaceSummarySchema>;

/** Present while a platform admin is acting as this user (support session). */
export const impersonationInfoSchema = z.object({
  id: z.string(),
  adminName: z.string(),
  /** Epoch ms; the session ends here and is never refreshed. */
  expiresAt: z.number(),
});
export type ImpersonationInfo = z.infer<typeof impersonationInfoSchema>;

/** Client → server payloads accepted by `useSession().update(...)`. */
export const sessionUpdateSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("refresh") }),
  z.object({
    action: z.literal("switch-workspace"),
    slug: z.string().nullable(),
  }),
]);
export type SessionUpdate = z.infer<typeof sessionUpdateSchema>;

export const SESSION_ERROR_REFRESH_FAILED = "RefreshFailed";
