"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useCallback } from "react";

import { dayjs } from "@/lib/dayjs";

import type { Granularity } from "../types";

/** How a bucket's first day reads: a day, the week starting then, or the month. */
export function useBucketLabel(granularity: Granularity) {
  const format = useFormatter();
  const t = useTranslations("analytics.trend");
  return useCallback(
    (date: string, length: "short" | "long") => {
      const day = dayjs(date).toDate();
      if (granularity === "month") {
        return format.dateTime(day, {
          month: length === "short" ? "short" : "long",
          year: "numeric",
        });
      }
      const label = format.dateTime(
        day,
        length === "short"
          ? { day: "numeric", month: "short" }
          : { dateStyle: "medium" },
      );
      return granularity === "week" && length === "long"
        ? t("weekOf", { date: label })
        : label;
    },
    [format, granularity, t],
  );
}
