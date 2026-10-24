import { queryOptions, useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parseData } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

export const workspaceDetailsSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  timezone: z.string(),
  locale: z.string(),
  logoUrl: z.string().nullable(),
  createdAt: z.string(),
});
export type WorkspaceDetails = z.infer<typeof workspaceDetailsSchema>;

export const getWorkspaceQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: queryKeys.workspaceDetails(slug),
    queryFn: async () =>
      parseData(
        workspaceDetailsSchema,
        (await apiClient.get("/workspace")).data,
      ),
    enabled: Boolean(slug),
  });

export const useWorkspaceDetails = () =>
  useQuery(getWorkspaceQueryOptions(useActiveWorkspaceSlug() ?? ""));
