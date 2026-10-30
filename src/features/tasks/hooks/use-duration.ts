"use client";

import { useTranslations } from "next-intl";

const MINUTES_PER_HOUR = 60;

/** "2h 30m" style durations, localised. */
export function useDuration() {
  const t = useTranslations("tasks.time");
  return (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
    const minutes = totalMinutes % MINUTES_PER_HOUR;
    if (hours === 0) return t("minutes", { minutes });
    if (minutes === 0) return t("hours", { hours });
    return t("hoursMinutes", { hours, minutes });
  };
}
