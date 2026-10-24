import { isAxiosError } from "axios";
import { z } from "zod";

const errorBodySchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

/** Normalized API failure. `code` is stable and maps to `errors.<code>` messages. */
export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number | null,
    readonly details?: unknown,
  ) {
    super(message);
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }
  if (isAxiosError(error)) {
    const status = error.response?.status ?? null;
    const body = errorBodySchema.safeParse(error.response?.data);
    if (body.success) {
      return new ApiError(
        body.data.error.code,
        body.data.error.message,
        status,
        body.data.error.details,
      );
    }
    return new ApiError(
      status === null ? "NETWORK_ERROR" : "UNKNOWN_ERROR",
      error.message,
      status,
    );
  }
  return new ApiError(
    "UNKNOWN_ERROR",
    error instanceof Error ? error.message : String(error),
    null,
  );
}
