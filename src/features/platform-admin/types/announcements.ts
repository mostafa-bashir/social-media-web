import { z } from "zod";

export const ANNOUNCEMENT_SEVERITIES = ["info", "warning"] as const;
export type AnnouncementSeverity = (typeof ANNOUNCEMENT_SEVERITIES)[number];

export const adminAnnouncementSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  severity: z.enum(ANNOUNCEMENT_SEVERITIES),
  tenantIds: z.array(z.string()).nullable(),
  /** Names of the targeted workspaces (empty for "all"). */
  tenants: z.array(
    z.object({ id: z.string(), name: z.string(), slug: z.string() }),
  ),
  startsAt: z.string(),
  endsAt: z.string().nullable(),
  state: z.enum(["scheduled", "live", "ended"]),
  createdByName: z.string().nullable(),
  createdAt: z.string(),
});
export type AdminAnnouncement = z.infer<typeof adminAnnouncementSchema>;

export interface AnnouncementInput {
  title: string;
  body: string;
  severity: AnnouncementSeverity;
  /** Null = every workspace. */
  tenantIds: string[] | null;
  startsAt?: string;
  endsAt: string | null;
}
