import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { clientEnv } from "@/config/env";

import { toApiError } from "./api-error";

interface RetriableConfig extends InternalAxiosRequestConfig {
  authRetried?: boolean;
}

type TokenRenewer = () => Promise<string | null>;
type SignedOutHandler = () => void;

/**
 * Admin console requests. Kept apart from `apiClient` so an agency session
 * and an admin session in the same browser never lend each other tokens.
 * `AdminSessionProvider` feeds the token in.
 */
let accessToken: string | null = null;
let renewToken: TokenRenewer | null = null;
let onSignedOut: SignedOutHandler | null = null;
let inFlightRenewal: Promise<string | null> | null = null;

export function setAdminApiSession(
  token: string | null,
  renew: TokenRenewer,
  signedOut: SignedOutHandler,
): void {
  accessToken = token;
  renewToken = renew;
  onSignedOut = signedOut;
}

function renewOnce(): Promise<string | null> {
  if (!renewToken) {
    return Promise.resolve(null);
  }
  inFlightRenewal ??= renewToken().finally(() => {
    inFlightRenewal = null;
  });
  return inFlightRenewal;
}

export const adminClient = axios.create({
  baseURL: `${clientEnv.NEXT_PUBLIC_API_URL}/admin`,
  headers: { "Content-Type": "application/json" },
});

adminClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

adminClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    const unauthenticated = error.response?.status === 401;
    if (!unauthenticated || !config || config.authRetried || !accessToken) {
      if (unauthenticated && accessToken) {
        onSignedOut?.();
      }
      return Promise.reject(toApiError(error));
    }
    config.authRetried = true;
    const renewed = await renewOnce();
    if (!renewed) {
      onSignedOut?.();
      return Promise.reject(toApiError(error));
    }
    config.headers.Authorization = `Bearer ${renewed}`;
    return adminClient(config);
  },
);
