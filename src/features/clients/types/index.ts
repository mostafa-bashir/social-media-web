import { z } from "zod";

export const clientSchema = z.object({
  id: z.string(),
  name: z.string(),
  timezone: z.string(),
  color: z.string().nullable(),
  notes: z.string().nullable(),
  targetCountries: z.array(z.string()).default([]),
  requireApproval: z.boolean().default(false),
  isProspect: z.boolean().default(false),
  /** A public channel the audit can rate before anything is connected. */
  publicYoutube: z
    .object({ channelId: z.string(), title: z.string() })
    .nullable()
    .default(null),
  logoUrl: z.string().nullable(),
  accountCount: z.number(),
  archivedAt: z.string().nullable(),
  createdAt: z.string(),
});
export type Client = z.infer<typeof clientSchema>;

export interface ClientInput {
  name: string;
  /** Omitted on create = the workspace timezone. */
  timezone?: string;
  color: string | null;
  notes: string | null;
  /** ISO 3166-1 alpha-2 codes of the client's markets. */
  targetCountries: string[];
  /** Posts need a `posts.approve` holder's sign-off. */
  requireApproval: boolean;
  /** Create only: a business being pitched. Clearing it is "convert". */
  isProspect?: boolean;
}

export const CLIENT_KINDS = ["all", "clients", "prospects"] as const;
export type ClientKind = (typeof CLIENT_KINDS)[number];

export interface ClientsQuery {
  page: number;
  pageSize: number;
  search?: string;
  archived: boolean;
  kind: ClientKind;
}
