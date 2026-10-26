"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";

import type { TrendLine } from "../lib/trend-rows";
import type { CompareMode } from "../types";

/** What a chart line is called in legends and tooltips. */
export function useLineLabel(compare: CompareMode) {
  const t = useTranslations("analytics.trend");
  const tPlatforms = useTranslations("common.platforms");
  return useCallback(
    (line: Pick<TrendLine, "label" | "platform" | "dashed">) => {
      if (line.dashed) {
        return t(compare === "year" ? "lastYear" : "previousPeriod");
      }
      if (line.label === "total") return t("total");
      // Platform series are labelled by their platform id.
      if (line.platform && line.label === line.platform) {
        return tPlatforms(line.platform);
      }
      return line.label;
    },
    [compare, t, tPlatforms],
  );
}
