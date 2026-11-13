"use client";

import { useFormatter, useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { routes } from "@/config/routes";
import { Link } from "@/i18n/navigation";

import { useDayLabel } from "../hooks/use-day-label";
import type { UsageOverview } from "../types/usage";

function TenantList({
  title,
  hint,
  empty,
  items,
}: {
  title: string;
  hint: string;
  empty: string;
  items: Array<{ tenantId: string; name: string; detail: ReactNode }>;
}) {
  return (
    <section className="surface-panel flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
        <p className="text-xs text-text-tertiary">{hint}</p>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-text-tertiary">{empty}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border-secondary">
          {items.map((item) => (
            <li
              key={item.tenantId}
              className="flex items-center justify-between gap-3 py-2 text-sm"
            >
              <Link
                href={routes.admin.tenant(item.tenantId)}
                className="truncate font-medium"
              >
                {item.name}
              </Link>
              <span className="shrink-0 text-text-secondary">
                {item.detail}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Who uses the platform most, and who has gone quiet (churn risk). */
export default function UsageTenantLists({
  overview,
}: {
  overview: UsageOverview;
}) {
  const t = useTranslations("admin.usage.lists");
  const format = useFormatter();
  const dayLabel = useDayLabel();

  return (
    <>
      <TenantList
        title={t("topTitle")}
        hint={t("topHint")}
        empty={t("topEmpty")}
        items={overview.topTenants.map((tenant) => ({
          tenantId: tenant.tenantId,
          name: tenant.name,
          detail: t("posts", { count: tenant.postsPublished }),
        }))}
      />
      <TenantList
        title={t("riskTitle")}
        hint={t("riskHint")}
        empty={t("riskEmpty")}
        items={overview.atRiskTenants.map((tenant) => ({
          tenantId: tenant.tenantId,
          name: tenant.name,
          detail: tenant.lastActiveDay
            ? t("lastActive", { day: dayLabel(tenant.lastActiveDay) })
            : t("neverActive", {
                created: format.dateTime(new Date(tenant.createdAt), {
                  dateStyle: "medium",
                }),
              }),
        }))}
      />
    </>
  );
}
