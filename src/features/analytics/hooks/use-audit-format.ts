"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useMemo } from "react";

import type { StatusTone } from "@/components/ui/StatusBadge";

import type { AuditCheck, AuditCheckKey, AuditStatus } from "../types/report";
import { UNKNOWN } from "./use-metric-format";

/** Checks measured as a share (0–1), shown as percentages. */
const RATIO_CHECKS: ReadonlySet<AuditCheckKey> = new Set([
  "engagementRate",
  "videoShare",
  "timing",
  "growth",
]);

/**
 * Small ratios need decimals: a −0.3% monthly loss must not read as "0%"
 * next to "losing followers".
 */
const RATIO_DECIMALS: Partial<Record<AuditCheckKey, number>> = {
  engagementRate: 2,
  growth: 1,
};

export const AUDIT_STATUS_TONE: Record<AuditStatus, StatusTone> = {
  good: "growth",
  fair: "accent",
  poor: "danger",
  noData: "neutral",
};

const GOOD_SCORE = 75;
const FAIR_SCORE = 50;

export const scoreTone = (score: number | null): StatusTone =>
  score === null
    ? "neutral"
    : score >= GOOD_SCORE
      ? "growth"
      : score >= FAIR_SCORE
        ? "accent"
        : "danger";

/** An audit check's measured value and its target, in words and local numbers. */
export function useAuditFormat() {
  const t = useTranslations("analytics.audit");
  const format = useFormatter();
  return useMemo(() => {
    const number = (key: AuditCheckKey, value: number) =>
      RATIO_CHECKS.has(key)
        ? format.number(value, {
            style: "percent",
            maximumFractionDigits: RATIO_DECIMALS[key] ?? 0,
            signDisplay: key === "growth" ? "exceptZero" : "auto",
          })
        : format.number(value, {
            maximumFractionDigits: key === "longestGap" ? 0 : 1,
          });

    const value = (check: AuditCheck) =>
      check.value === null
        ? UNKNOWN
        : t(`units.${check.key}`, { value: number(check.key, check.value) });

    const target = (check: AuditCheck) => {
      const { min, max } = check.good;
      if (min !== null && max !== null) {
        return t("target.between", {
          min: number(check.key, min),
          max: number(check.key, max),
        });
      }
      if (min !== null) {
        return t("target.atLeast", { value: number(check.key, min) });
      }
      return max === null
        ? ""
        : t("target.atMost", { value: number(check.key, max) });
    };

    return { value, target };
  }, [format, t]);
}
