import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parsePaginated } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

import { clientSchema, type ClientsQuery } from "../types";

export function useClients(query: ClientsQuery) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.clients(slug), "list", query],
    queryFn: async () =>
      parsePaginated(
        clientSchema,
        (
          await apiClient.get("/clients", {
            params: { ...query, search: query.search || undefined },
          })
        ).data,
      ),
    placeholderData: keepPreviousData,
    enabled: Boolean(slug),
  });
}
