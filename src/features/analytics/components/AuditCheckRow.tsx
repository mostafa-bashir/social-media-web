"use client";

import { useTranslations } from "next-intl";

import StatusBadge from "@/components/ui/StatusBadge";

import { AUDIT_STATUS_TONE, useAuditFormat } from "../hooks/use-audit-format";
import type { AuditCheck } from "../types/report";

/** One check: what it measures, the result against its target, and what to do. */
export default function AuditCheckRow({ check }: { check: AuditCheck }) {
  const t = useTranslations("analytics.audit");
  const fmt = useAuditFormat();
  const rated = check.status !== "noData";

  return (
    <li className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:gap-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-text-primary">
            {t(`checks.${check.key}`)}
          </span>
          <StatusBadge tone={AUDIT_STATUS_TONE[check.status]}>
            {t(`status.${check.status}`)}
          </StatusBadge>
        </div>
        <p className="text-sm text-text-secondary">
          {rated
            ? t(`advice.${check.key}.${check.status}`)
            : t("advice.noData")}
        </p>
      </div>
      <dl className="flex shrink-0 gap-4 text-sm sm:flex-col sm:items-end sm:gap-0">
        <div className="flex gap-1">
          <dt className="sr-only">{t("measured")}</dt>
          <dd className="font-semibold text-text-primary">
            {fmt.value(check)}
          </dd>
        </div>
        <div className="flex gap-1">
          <dt className="sr-only">{t("targetLabel")}</dt>
          <dd className="text-xs text-text-tertiary">{fmt.target(check)}</dd>
        </div>
      </dl>
    </li>
  );
}
