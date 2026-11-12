import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parsePaginated } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

import { type ClientKind, clientSchema, type ClientsQuery } from "../types";

const PROSPECT_PARAM: Record<ClientKind, boolean | undefined> = {
  all: undefined,
  clients: false,
  prospects: true,
};

export function useClients({ kind, ...query }: ClientsQuery) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.clients(slug), "list", { ...query, kind }],
    queryFn: async () =>
      parsePaginated(
        clientSchema,
        (
          await apiClient.get("/clients", {
            params: {
              ...query,
              search: query.search || undefined,
              prospect: PROSPECT_PARAM[kind],
            },
          })
        ).data,
      ),
    placeholderData: keepPreviousData,
    enabled: Boolean(slug),
  });
}
