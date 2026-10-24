"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";

import { toApiError } from "@/lib/api/api-error";

/**
 * Turns any thrown error (or an Auth.js sign-in error code) into a translated,
 * user-friendly message via the `errors` namespace, keyed by API error code.
 */
export function useErrorMessage(): (errorOrCode: unknown) => string {
  const t = useTranslations("errors");
  return useCallback(
    (errorOrCode: unknown) => {
      const code =
        typeof errorOrCode === "string"
          ? errorOrCode
          : toApiError(errorOrCode).code;
      return t.has(code) ? t(code) : t("UNKNOWN_ERROR");
    },
    [t],
  );
}
