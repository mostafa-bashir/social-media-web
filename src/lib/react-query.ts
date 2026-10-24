import { QueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/api-error";

const STALE_TIME_MS = 60_000;
const NON_RETRYABLE_STATUSES = new Set([400, 401, 403, 404, 409, 429]);

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME_MS,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) =>
          !(
            error instanceof ApiError &&
            error.status !== null &&
            NON_RETRYABLE_STATUSES.has(error.status)
          ) && failureCount < 1,
      },
    },
  });
}
