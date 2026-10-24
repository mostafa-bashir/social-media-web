import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { z } from "zod";

import { clientEnv } from "@/config/env";

import { toApiError } from "./api-error";
import {
  type ApiSession,
  getApiSession,
  refreshApiSession,
  signOutFromApi,
} from "./api-session";

export const TENANT_HEADER = "X-Tenant-Slug";

interface RetriableConfig extends InternalAxiosRequestConfig {
  authRetried?: boolean;
}

function applySession(
  config: InternalAxiosRequestConfig,
  session: ApiSession,
): InternalAxiosRequestConfig {
  if (session.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  if (session.workspaceSlug) {
    config.headers[TENANT_HEADER] = session.workspaceSlug;
  }
  return config;
}

export const apiClient = axios.create({
  baseURL: clientEnv.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) =>
  applySession(config, getApiSession()),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    if (error.response?.status !== 401 || !config || config.authRetried) {
      if (error.response?.status === 401) {
        signOutFromApi();
      }
      return Promise.reject(toApiError(error));
    }

    config.authRetried = true;
    const refreshed = await refreshApiSession();
    if (!refreshed?.accessToken) {
      signOutFromApi();
      return Promise.reject(toApiError(error));
    }
    return apiClient(applySession(config, refreshed));
  },
);

/** Unwraps the API's `{ data }` envelope and validates it against `schema`. */
export function parseData<T>(schema: z.ZodType<T>, body: unknown): T {
  return z.object({ data: schema }).parse(body).data;
}

const paginationMetaSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export interface Paginated<T> {
  data: T[];
  meta: z.infer<typeof paginationMetaSchema>;
}

/** Unwraps and validates a `{ data, meta }` list response. */
export function parsePaginated<T>(
  itemSchema: z.ZodType<T>,
  body: unknown,
): Paginated<T> {
  return z
    .object({ data: z.array(itemSchema), meta: paginationMetaSchema })
    .parse(body);
}
