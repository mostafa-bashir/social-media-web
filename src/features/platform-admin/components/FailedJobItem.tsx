"use client";

import { Button } from "antd";
import { useFormatter, useTranslations } from "next-intl";

import { routes } from "@/config/routes";
import { Link } from "@/i18n/navigation";

import type { FailedJob } from "../types/health";

/** One failed job: what failed, why, where; actions only for super admins. */
export default function FailedJobItem({
  job,
  canManage,
  busy,
  onRetry,
  onRemove,
}: {
  job: FailedJob;
  canManage: boolean;
  /** Any action in flight: blocks double submits on every row. */
  busy: boolean;
  onRetry: () => void;
  onRemove: () => void;
}) {
  const t = useTranslations("admin.health.failedJobs");
  const format = useFormatter();

  return (
    <li className="surface-panel flex flex-col gap-2 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono" dir="ltr">
          {job.name}
        </span>
        <span className="text-text-tertiary">
          {job.failedAt
            ? format.dateTime(new Date(job.failedAt), {
                dateStyle: "medium",
                timeStyle: "short",
              })
            : "—"}
        </span>
      </div>
      <p className="break-words text-text-secondary" dir="ltr">
        {job.failedReason || t("noReason")}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-text-tertiary">
          {t("attempts", { count: job.attemptsMade })}
          {job.tenantId ? (
            <>
              {" · "}
              <Link href={routes.admin.tenant(job.tenantId)}>
                {t("workspace")}
              </Link>
            </>
          ) : null}
        </span>
        {canManage ? (
          <span className="flex gap-2">
            <Button size="small" disabled={busy} onClick={onRetry}>
              {t("retry")}
            </Button>
            <Button size="small" danger disabled={busy} onClick={onRemove}>
              {t("remove")}
            </Button>
          </span>
        ) : null}
      </div>
    </li>
  );
}
