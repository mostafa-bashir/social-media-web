import { z } from "zod";

export const clientSchema = z.object({
  id: z.string(),
  name: z.string(),
  timezone: z.string(),
  color: z.string().nullable(),
  notes: z.string().nullable(),
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
}

export interface ClientsQuery {
  page: number;
  pageSize: number;
  search?: string;
  archived: boolean;
}
