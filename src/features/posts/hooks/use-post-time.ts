"use client";

import { useFormatter } from "next-intl";
import { useCallback } from "react";

/** Formats a UTC instant in `timezone`, in the UI locale (e.g. "Nov 2, 2026, 9:30 AM"). */
export function usePostTime(timezone: string) {
  const format = useFormatter();
  return useCallback(
    (utcIso: string | null) =>
      utcIso
        ? format.dateTime(new Date(utcIso), {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: timezone,
          })
        : "—",
    [format, timezone],
  );
}
