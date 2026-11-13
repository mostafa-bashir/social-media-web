"use client";

import { useFormatter } from "next-intl";
import { useCallback } from "react";

/** Labels a `YYYY-MM-DD` UTC day; usage days are UTC, so they're shown as UTC. */
export function useDayLabel(): (
  day: string,
  style?: "short" | "long",
) => string {
  const format = useFormatter();
  return useCallback(
    (day, style = "short") =>
      format.dateTime(new Date(`${day}T00:00:00Z`), {
        timeZone: "UTC",
        month: "short",
        day: "numeric",
        ...(style === "long" ? { weekday: "short", year: "numeric" } : {}),
      }),
    [format],
  );
}
