import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parseData, parsePaginated } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

import {
  clientOptionSchema,
  platformAvailabilitySchema,
  selectionSchema,
  socialAccountSchema,
  type SocialAccountsQuery,
} from "../types";

/** One page of matches; typing narrows it server-side, so every client is reachable. */
const CLIENT_OPTIONS_PAGE_SIZE = 50;

export function useSocialAccounts(query: SocialAccountsQuery) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.socialAccounts(slug), "list", query],
    queryFn: async () =>
      parsePaginated(
        socialAccountSchema,
        (await apiClient.get("/social-accounts", { params: query })).data,
      ),
    placeholderData: keepPreviousData,
    enabled: Boolean(slug),
  });
}

export function usePlatformAvailability() {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.socialAccounts(slug), "platforms"],
    queryFn: async () =>
      parseData(
        z.array(platformAvailabilitySchema),
        (await apiClient.get("/social-accounts/platforms")).data,
      ),
    enabled: Boolean(slug),
  });
}

/**
 * Active clients matching `search`, for pickers. Own key under the clients
 * prefix (features never import each other).
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

export function useConnectSelection(selectionKey: string) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.socialAccounts(slug), "selection", selectionKey],
    queryFn: async () =>
      parseData(
        selectionSchema,
        (
          await apiClient.get(
            `/social-accounts/oauth/selections/${selectionKey}`,
          )
        ).data,
      ),
    enabled: Boolean(slug),
    // A selection is single-use; refetching after confirm would only 404.
    retry: false,
    refetchOnWindowFocus: false,
  });
}
