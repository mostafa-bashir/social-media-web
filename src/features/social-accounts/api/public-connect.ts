import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useLocale } from "next-intl";
import { z } from "zod";

import { clientEnv } from "@/config/env";
import { parseData } from "@/lib/api/api-client";
import { toApiError } from "@/lib/api/api-error";

import { readConnectNonce, saveConnectFlow } from "../lib/connect-nonce";
import { platformSchema, type SocialPlatform } from "../types";

/** No session and no workspace header: the link token alone opens the flow. */
const publicClient = axios.create({ baseURL: clientEnv.NEXT_PUBLIC_API_URL });
const NONCE_HEADER = "X-Connect-Nonce";

/** The nonce proves this browser opened the link (see the API's flow service). */
const withNonce = () => ({ headers: { [NONCE_HEADER]: readConnectNonce() } });

async function call<T>(
  schema: z.ZodType<T>,
  request: Promise<{ data: unknown }>,
) {
  try {
    return parseData(schema, (await request).data);
  } catch (error) {
    throw toApiError(error);
  }
}

const publicLinkSchema = z.object({
  workspace: z.object({ name: z.string() }),
  client: z.object({ name: z.string(), logoUrl: z.string().nullable() }),
  expiresAt: z.string(),
  platforms: z.array(
    z.object({ platform: platformSchema, configured: z.boolean() }),
  ),
});
export type PublicConnectLink = z.infer<typeof publicLinkSchema>;

export const publicSelectionSchema = z.object({
  platform: platformSchema,
  client: z.object({ name: z.string() }),
  accounts: z.array(
    z.object({
      externalId: z.string(),
      displayName: z.string(),
      username: z.string().nullable(),
      avatarUrl: z.string().nullable(),
      alreadyConnected: z.boolean(),
      unavailable: z.boolean(),
    }),
  ),
});
export type PublicSelection = z.infer<typeof publicSelectionSchema>;

const resultSchema = z.object({
  connected: z.array(
    z.object({ platform: platformSchema, displayName: z.string() }),
  ),
});

export function usePublicConnectLink(token: string) {
  return useQuery({
    queryKey: ["public-connect", token],
    queryFn: () =>
      call(
        publicLinkSchema,
        publicClient.get(`/public/connect/links/${encodeURIComponent(token)}`),
      ),
    retry: false,
    // Each call counts against a per-IP limit shared by everyone on the same
    // network; the link doesn't change while the page is open.
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}

/** Keeps the nonce for this tab, then sends the browser to the platform. */
export function useStartLinkConnect(token: string) {
  const locale = useLocale();
  return useMutation({
    mutationFn: async (platform: SocialPlatform) => {
      const { authorizationUrl, nonce } = await call(
        z.object({ authorizationUrl: z.url(), nonce: z.string() }),
        publicClient.post(
          `/public/connect/links/${encodeURIComponent(token)}/${platform}/start`,
          { locale },
        ),
      );
      // Only ever leave for a platform's https consent page.
      if (new URL(authorizationUrl).protocol !== "https:") {
        throw new Error("Unexpected consent URL");
      }
      saveConnectFlow({ nonce, token });
      window.location.assign(authorizationUrl);
    },
  });
}

export function useCompleteLinkConnect() {
  return useMutation({
    mutationFn: (input: {
      platform: SocialPlatform;
      state: string;
      code?: string;
      error?: string;
    }) =>
      call(
        z.object({ selectionKey: z.string() }),
        publicClient.post(
          `/public/connect/${input.platform}/complete`,
          { state: input.state, code: input.code, error: input.error },
          withNonce(),
        ),
      ),
  });
}

export function useLinkSelection(selectionKey: string | null) {
  return useQuery({
    queryKey: ["public-connect-selection", selectionKey],
    queryFn: () =>
      call(
        publicSelectionSchema,
        publicClient.get(
          `/public/connect/selections/${selectionKey ?? ""}`,
          withNonce(),
        ),
      ),
    enabled: Boolean(selectionKey),
    // Single-use: refetching after the confirm would only 404.
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  });
}

export function useConfirmLinkSelection(selectionKey: string | null) {
  return useMutation({
    mutationFn: (externalIds: string[]) =>
      call(
        resultSchema,
        publicClient.post(
          `/public/connect/selections/${selectionKey ?? ""}`,
          { externalIds },
          withNonce(),
        ),
      ),
  });
}
