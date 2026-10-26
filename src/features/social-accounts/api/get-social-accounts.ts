import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parseData, parsePaginated } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

import {
  platformAvailabilitySchema,
  selectionSchema,
  socialAccountSchema,
  type SocialAccountsQuery,
} from "../types";

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
