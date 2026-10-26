"use client";

import { useFormatter } from "next-intl";
import { useCallback } from "react";

/** 1 January 2024 was a Monday, so ISO weekday n is that date plus n − 1 days. */
const MONDAY = Date.UTC(2024, 0, 1);
const DAY_MS = 24 * 60 * 60_000;

/** Localized names for ISO weekdays (1 = Monday) and hours of the day. */
export function useSlotLabel() {
  const format = useFormatter();
  const weekday = useCallback(
    (isoWeekday: number, width: "long" | "short" = "long") =>
      format.dateTime(new Date(MONDAY + (isoWeekday - 1) * DAY_MS), {
        weekday: width,
        timeZone: "UTC",
      }),
    [format],
  );
  const hour = useCallback(
    (value: number) =>
      format.dateTime(new Date(MONDAY + value * 60 * 60_000), {
        hour: "numeric",
        timeZone: "UTC",
      }),
    [format],
  );
  return { weekday, hour };
}
