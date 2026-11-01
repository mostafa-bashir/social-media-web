import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { platformSchema } from "@/config/platforms";
import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parsePaginated } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

export const ACCOUNTS_PREVIEW_LIMIT = 5;

const accountSchema = z.object({
  id: z.string(),
  platform: platformSchema,
  displayName: z.string(),
  client: z.object({ id: z.string(), name: z.string() }),
  lastError: z.string().nullable(),
});
export type DashboardAccount = z.infer<typeof accountSchema>;

function useAccountsQuery(
  key: string,
  params: Record<string, string | number | undefined>,
  enabled: boolean,
) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.socialAccounts(slug), key, params],
    queryFn: async () =>
      parsePaginated(
        accountSchema,
        (await apiClient.get("/social-accounts", { params })).data,
      ),
    enabled: enabled && Boolean(slug),
  });
}

/** Accounts whose tokens the platform rejected; only a reconnect fixes them. */
export function useReconnectAccounts(enabled: boolean, clientId?: string) {
  return useAccountsQuery(
    "dashboard-reconnect",
    {
      clientId,
      status: "reconnect_required",
      pageSize: ACCOUNTS_PREVIEW_LIMIT,
    },
    enabled,
  );
}

/** Only `meta.total` is read. */
export function useConnectedAccountCount(enabled: boolean, clientId?: string) {
  return useAccountsQuery(
    "dashboard-count",
    { clientId, pageSize: 1 },
    enabled,
  );
}
