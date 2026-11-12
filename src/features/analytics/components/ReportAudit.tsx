"use client";

import { Alert } from "antd";
import { useFormatter, useTranslations } from "next-intl";

import StatusBadge from "@/components/ui/StatusBadge";

import { scoreTone } from "../hooks/use-audit-format";
import type { Audit } from "../types/report";
import AuditPlatformCard from "./AuditPlatformCard";

/** The social media audit: an overall score, then each platform's checks. */
export default function ReportAudit({ audit }: { audit: Audit }) {
  const t = useTranslations("analytics.audit");
  const format = useFormatter();
  const day = (iso: string) =>
    format.dateTime(new Date(`${iso}T00:00:00Z`), {
      dateStyle: "medium",
      timeZone: "UTC",
    });

  const preview = audit.publicPreview;
  const previewAlert =
    preview && preview.status !== "ok" ? (
      <Alert
        type={preview.status === "not_configured" ? "info" : "warning"}
        showIcon
        title={t(`publicPreview.${preview.status}`, { title: preview.title })}
      />
    ) : null;

  if (audit.platforms.length === 0) {
    return (
      previewAlert ?? <Alert type="info" showIcon title={t("noAccounts")} />
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <div
          className="flex flex-col"
          role="img"
          aria-label={
            audit.score === null
              ? t("noScore")
              : t("score", { score: audit.score })
          }
        >
          <span className="text-4xl font-semibold text-text-primary">
            {audit.score ?? "—"}
            <span className="text-base font-normal text-text-tertiary">
              {" "}
              / 100
            </span>
          </span>
        </div>
        <div className="flex flex-col items-start gap-1">
          <StatusBadge tone={scoreTone(audit.score)}>
            {t(`verdict.${scoreTone(audit.score)}`)}
          </StatusBadge>
          <span className="text-xs text-text-tertiary">
            {t("window", {
              days: audit.windowDays,
              from: day(audit.from),
              to: day(audit.to),
            })}
          </span>
        </div>
      </div>
      {previewAlert}
      {audit.pendingSync > 0 ? (
        <Alert
          type="info"
          showIcon
          title={t("pendingSync", { count: audit.pendingSync })}
        />
      ) : null}
      {audit.platforms.map((platform) => (
        <AuditPlatformCard key={platform.platform} audit={platform} />
      ))}
      <p className="text-xs text-text-tertiary">{t("disclaimer")}</p>
    </div>
  );
}
