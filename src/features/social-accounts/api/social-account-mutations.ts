import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { z } from "zod";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parseData } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

import { socialAccountSchema, type SocialPlatform } from "../types";

/** Index of the sub-key after `["workspace", slug, "social-accounts"]`. */
const SUB_KEY_INDEX = 3;

/**
 * Account changes also refresh client account counts. Selections are
 * single-use, so they are never refetched (it would only 404).
 */
function useInvalidateAccounts() {
  const slug = useActiveWorkspaceSlug() ?? "";
  const queryClient = useQueryClient();
  return async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.socialAccounts(slug),
      predicate: (query) => query.queryKey[SUB_KEY_INDEX] !== "selection",
    });
    await queryClient.invalidateQueries({ queryKey: queryKeys.clients(slug) });
  };
}

/** Starts the platform consent flow and sends the browser to the platform. */
export function useStartConnect() {
  const locale = useLocale();
  return useMutation({
    mutationFn: async (input: {
      platform: SocialPlatform;
      clientId: string;
    }) => {
      const { authorizationUrl } = parseData(
        z.object({ authorizationUrl: z.url() }),
        (
          await apiClient.post(
            `/social-accounts/oauth/${input.platform}/start`,
            {
              clientId: input.clientId,
              locale,
            },
          )
        ).data,
      );
      window.location.assign(authorizationUrl);
    },
  });
}

/**
 * Relays the platform redirect to the API from this signed-in session; the
 * API only exchanges the code if this session started the connection.
 */
export function useCompleteConnect() {
  return useMutation({
    mutationFn: async ({
      platform,
      ...body
    }: {
      platform: SocialPlatform;
      state: string;
      code?: string;
      error?: string;
    }) =>
      parseData(
        z.object({ selectionKey: z.string() }),
        (
          await apiClient.post(
            `/social-accounts/oauth/${platform}/complete`,
            body,
          )
        ).data,
      ),
  });
}

export function useConfirmSelection(selectionKey: string) {
  const onSuccess = useInvalidateAccounts();
  return useMutation({
    mutationFn: async (externalIds: string[]) =>
      parseData(
        z.array(socialAccountSchema),
        (
          await apiClient.post(
            `/social-accounts/oauth/selections/${selectionKey}`,
            { externalIds },
          )
        ).data,
      ),
    onSuccess,
  });
}

export function useDisconnectAccount() {
  const onSuccess = useInvalidateAccounts();
  return useMutation({
    mutationFn: (accountId: string) =>
      apiClient.delete(`/social-accounts/${accountId}`),
    onSuccess,
  });
}
