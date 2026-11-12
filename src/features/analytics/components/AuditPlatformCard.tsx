"use client";

import { useTranslations } from "next-intl";

import PlatformBadge from "@/components/ui/PlatformBadge";
import StatusBadge from "@/components/ui/StatusBadge";

import { scoreTone } from "../hooks/use-audit-format";
import type { Audit } from "../types/report";
import AuditCheckRow from "./AuditCheckRow";

/** One platform's checks, with its own score. */
export default function AuditPlatformCard({
  audit,
}: {
  audit: Audit["platforms"][number];
}) {
  const t = useTranslations("analytics.audit");

  return (
    <div className="surface-panel flex flex-col break-inside-avoid">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-secondary pb-3">
        <div className="flex items-center gap-3">
          <PlatformBadge platform={audit.platform} />
          <span className="text-xs text-text-tertiary">
            {t("posts", { count: audit.posts })}
          </span>
          {audit.source === "public" ? (
            <StatusBadge tone="brand">{t("publicData")}</StatusBadge>
          ) : null}
        </div>
        <StatusBadge tone={scoreTone(audit.score)}>
          {audit.score === null
            ? t("noScore")
            : t("score", { score: audit.score })}
        </StatusBadge>
      </div>
      {audit.source === "public" ? (
        <p className="pt-3 text-xs text-text-tertiary">{t("publicDataHint")}</p>
      ) : null}
      <ul className="flex flex-col divide-y divide-border-secondary">
        {audit.checks.map((check) => (
          <AuditCheckRow key={check.key} check={check} />
        ))}
      </ul>
    </div>
  );
}
