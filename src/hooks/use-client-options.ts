import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parseData, parsePaginated } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

export const clientOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  timezone: z.string(),
  /** ISO country codes of the client's markets (trends default to the first). */
  targetCountries: z.array(z.string()).default([]),
});
export type ClientOption = z.infer<typeof clientOptionSchema>;

/** One page of matches; typing narrows it server-side, so every client is reachable. */
const CLIENT_OPTIONS_PAGE_SIZE = 50;

/**
 * Active clients matching `search`, for pickers in any feature. Own key
 * under the clients prefix, so client changes invalidate it too.
 */
export function useClientOptions(search: string) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.clients(slug), "options", search],
    queryFn: async () =>
      parsePaginated(
        clientOptionSchema,
        (
          await apiClient.get("/clients", {
            params: {
              pageSize: CLIENT_OPTIONS_PAGE_SIZE,
              search: search || undefined,
            },
          })
        ).data,
      ).data,
    placeholderData: keepPreviousData,
    enabled: Boolean(slug),
  });
}

/** The picked client, so its name shows even when it isn't in the current matches. */
export function useClientOption(clientId: string | undefined) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.clients(slug), "option", clientId],
    queryFn: async () =>
      parseData(
        clientOptionSchema,
        (await apiClient.get(`/clients/${clientId}`)).data,
      ),
    enabled: Boolean(slug && clientId),
  });
}
